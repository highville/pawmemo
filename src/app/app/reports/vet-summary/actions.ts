"use server";

import {
  AI_PROVIDER,
  AI_VET_READY_SUMMARY_FEATURE,
  AI_VET_READY_SUMMARY_MODEL,
  estimateAICostUsd,
  logAIUsageEvent
} from "@/lib/ai-usage";
import { getCurrentUser, getFirstPet, getUserMemories } from "@/lib/app-data";

const MAX_MEMORIES_FOR_SUMMARY = 30;
const MAX_CARE_SIGNALS_FOR_SUMMARY = 30;
const MAX_MEMORY_BODY_LENGTH = 320;
const MAX_CARE_NOTE_LENGTH = 220;
const UNSAFE_SUMMARY_LANGUAGE = /diagnos|disease|illness|treatment|medication|emergency|urgent|infection|cancer|symptom|persist|worsen|medical condition|indicated|advised|suggest any changes|recommend|this indicates|this suggests|(your pet|pet|momo)\s+may have/i;

type VetSummaryPayload = {
  overview?: unknown;
  timeline?: unknown;
  appetiteNotes?: unknown;
  energyBehaviorNotes?: unknown;
  vetVisitNotes?: unknown;
  otherObservations?: unknown;
  questionsForVet?: unknown;
};

export type VetSummaryResult = {
  ok: boolean;
  message?: string;
  savedReportId?: string | null;
  sections: {
    overview: string;
    timeline: string[];
    appetiteNotes: string[];
    energyBehaviorNotes: string[];
    vetVisitNotes: string[];
    otherObservations: string[];
    questionsForVet: string[];
  } | null;
};

export async function generateVetReadySummary(): Promise<VetSummaryResult> {
  const { supabase, user } = await getCurrentUser();

  if (!user) {
    return emptyResult("Please sign in before generating a Vet-ready Summary.");
  }

  const pet = await getFirstPet(user.id);

  if (!pet) {
    return emptyResult("Create a pet profile first, then PawMemo can organize notes for your vet.");
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const memories = (await getUserMemories(user.id))
    .filter((memory) => new Date(memory.occurred_at).getTime() >= since.getTime())
    .slice(0, MAX_MEMORIES_FOR_SUMMARY);

  const { data: careSignals } = await supabase
    .from("care_signals")
    .select("signal_type, note, observed_at, memory_id")
    .eq("owner_id", user.id)
    .gte("observed_at", since.toISOString())
    .order("observed_at", { ascending: false })
    .limit(MAX_CARE_SIGNALS_FOR_SUMMARY);

  if (memories.length === 0 && (!careSignals || careSignals.length === 0)) {
    return emptyResult("No recent memories or care notes yet. Add a few quick entries, then come back for a summary.");
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    await logVetSummaryUsage({
      ownerId: user.id,
      success: false,
      errorCode: "missing_api_key"
    });

    return emptyResult("Vet-ready Summary AI is not set up yet. Your notes are still available in Timeline.");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: AI_VET_READY_SUMMARY_MODEL,
        instructions: [
          "You organize pet journal notes into a neutral Vet-ready Summary.",
          "Use only note-based language: 'the notes mention' or 'recorded observations include'.",
          "Do not diagnose. Do not infer disease. Do not say the pet may have a condition.",
          "Do not provide medication, treatment, emergency guidance, or urgency levels.",
          "Questions must be phrased as questions the pet parent may want to ask a veterinarian.",
          "Mention photo records only as photo records; never analyze image contents.",
          "Return only the requested JSON shape."
        ].join(" "),
        input: JSON.stringify({
          petName: pet.name,
          petType: pet.species,
          dateRange: {
            days: 30,
            since: since.toISOString()
          },
          memories: memories.map((memory) => ({
            occurredAt: memory.occurred_at,
            body: memory.body.slice(0, MAX_MEMORY_BODY_LENGTH),
            tag: memory.savedTag,
            hasPhoto: Boolean(memory.signedImageUrl || memory.image_url)
          })),
          careSignals: (careSignals ?? []).map((signal) => ({
            observedAt: signal.observed_at,
            type: signal.signal_type,
            note: signal.note.slice(0, MAX_CARE_NOTE_LENGTH),
            memoryId: signal.memory_id
          }))
        }),
        text: {
          format: {
            type: "json_schema",
            name: "pawmemo_vet_ready_summary",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                overview: {
                  type: "string",
                  maxLength: 900
                },
                timeline: {
                  type: "array",
                  maxItems: 8,
                  items: {
                    type: "string",
                    maxLength: 180
                  }
                },
                appetiteNotes: {
                  type: "array",
                  maxItems: 5,
                  items: {
                    type: "string",
                    maxLength: 180
                  }
                },
                energyBehaviorNotes: {
                  type: "array",
                  maxItems: 5,
                  items: {
                    type: "string",
                    maxLength: 180
                  }
                },
                vetVisitNotes: {
                  type: "array",
                  maxItems: 5,
                  items: {
                    type: "string",
                    maxLength: 180
                  }
                },
                otherObservations: {
                  type: "array",
                  maxItems: 5,
                  items: {
                    type: "string",
                    maxLength: 180
                  }
                },
                questionsForVet: {
                  type: "array",
                  maxItems: 5,
                  items: {
                    type: "string",
                    maxLength: 180
                  }
                }
              },
              required: [
                "overview",
                "timeline",
                "appetiteNotes",
                "energyBehaviorNotes",
                "vetVisitNotes",
                "otherObservations",
                "questionsForVet"
              ]
            }
          }
        },
        reasoning: {
          effort: "minimal"
        },
        max_output_tokens: 1200
      })
    });

    if (!response.ok) {
      await logVetSummaryUsage({
        ownerId: user.id,
        success: false,
        errorCode: `provider_http_${response.status}`
      });

      return emptyResult("Vet-ready Summary is unavailable right now. Please try again later.");
    }

    const payload = await response.json();
    const usage = extractUsage(payload);
    const parsed = parseVetSummaryJson(payload);

    if (!parsed) {
      await logVetSummaryUsage({
        ownerId: user.id,
        success: false,
        errorCode: "invalid_response",
        ...usage
      });

      return emptyResult("The summary came back in an unexpected format. Please try again later.");
    }

    const sections = normalizeSections(parsed);

    if (!sections.overview || hasUnsafeLanguage(sections)) {
      await logVetSummaryUsage({
        ownerId: user.id,
        success: false,
        errorCode: "unsafe_response",
        ...usage
      });

      return emptyResult("The summary needs a more neutral rewrite. Please try again.");
    }

    await logVetSummaryUsage({
      ownerId: user.id,
      success: true,
      ...usage
    });

    const reportTitle = `Vet-ready Summary for ${pet.name}`;
    const saveResult = await supabase
      .from("generated_reports")
      .insert({
        owner_id: user.id,
        pet_id: pet.id,
        report_type: "vet_ready_summary",
        title: reportTitle,
        content: formatVetSummaryContent(reportTitle, sections),
        period_start: toDateOnly(since),
        period_end: toDateOnly(new Date()),
        source_memory_count: memories.length,
        source_care_signal_count: careSignals?.length ?? 0,
        included_photo_records: memories.some((memory) => memory.signedImageUrl || memory.image_url),
        model: AI_VET_READY_SUMMARY_MODEL
      })
      .select("id")
      .single();

    return {
      ok: true,
      message: saveResult.error ? "Summary generated, but it could not be saved to report history yet." : undefined,
      savedReportId: saveResult.data?.id ?? null,
      sections
    };
  } catch {
    await logVetSummaryUsage({
      ownerId: user.id,
      success: false,
      errorCode: "request_failed"
    });

    return emptyResult("Vet-ready Summary is unavailable right now. Please try again later.");
  }
}

function emptyResult(message: string): VetSummaryResult {
  return {
    ok: false,
    message,
    sections: null
  };
}

function formatVetSummaryContent(title: string, sections: NonNullable<VetSummaryResult["sections"]>) {
  const list = (heading: string, items: string[]) => [
    heading,
    ...(items.length > 0 ? items.map((item) => `- ${item}`) : ["- No specific notes in this category."])
  ].join("\n");

  return [
    title,
    "This summary organizes your notes and is not a medical diagnosis.",
    "",
    "Overview",
    sections.overview,
    "",
    list("Timeline of notable notes", sections.timeline),
    "",
    list("Appetite / eating-related notes", sections.appetiteNotes),
    "",
    list("Energy / behavior-related notes", sections.energyBehaviorNotes),
    "",
    list("Vet visit-related notes", sections.vetVisitNotes),
    "",
    list("Other observations", sections.otherObservations),
    "",
    list("Questions to consider asking the vet", sections.questionsForVet)
  ].join("\n");
}

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function logVetSummaryUsage(input: {
  ownerId: string;
  success: boolean;
  errorCode?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
}) {
  await logAIUsageEvent({
    ownerId: input.ownerId,
    feature: AI_VET_READY_SUMMARY_FEATURE,
    provider: AI_PROVIDER,
    model: AI_VET_READY_SUMMARY_MODEL,
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    totalTokens: input.totalTokens,
    success: input.success,
    errorCode: input.errorCode
  });

  estimateAICostUsd({
    model: AI_VET_READY_SUMMARY_MODEL,
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    totalTokens: input.totalTokens
  });
}

function extractUsage(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("usage" in payload)) {
    return {};
  }

  const usage = payload.usage;

  if (!usage || typeof usage !== "object") {
    return {};
  }

  const inputTokens = readNumber(usage, "input_tokens");
  const outputTokens = readNumber(usage, "output_tokens");
  const totalTokens = readNumber(usage, "total_tokens") ?? (inputTokens !== null || outputTokens !== null ? (inputTokens ?? 0) + (outputTokens ?? 0) : null);

  return {
    inputTokens,
    outputTokens,
    totalTokens
  };
}

function readNumber(value: object, key: string) {
  if (!(key in value)) {
    return null;
  }

  const raw = value[key as keyof typeof value];

  return typeof raw === "number" ? raw : null;
}

function parseVetSummaryJson(payload: unknown) {
  const parsedOutput = extractParsedOutput(payload);

  if (parsedOutput) {
    return parsedOutput;
  }

  const text = extractOutputText(payload);

  if (!text) {
    return null;
  }

  try {
    const parsed = JSON.parse(extractJsonObject(text));

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed as VetSummaryPayload;
  } catch {
    return null;
  }
}

function extractParsedOutput(payload: unknown): VetSummaryPayload | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("parsed" in payload && isVetSummaryPayload(payload.parsed)) {
    return payload.parsed;
  }

  const output = "output" in payload && Array.isArray(payload.output) ? payload.output : [];

  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    if ("parsed" in item && isVetSummaryPayload(item.parsed)) {
      return item.parsed;
    }

    if (!("content" in item) || !Array.isArray(item.content)) {
      continue;
    }

    for (const content of item.content) {
      if (content && typeof content === "object" && "parsed" in content && isVetSummaryPayload(content.parsed)) {
        return content.parsed;
      }
    }
  }

  return null;
}

function extractOutputText(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("output_text" in payload && typeof payload.output_text === "string") {
    return payload.output_text;
  }

  const output = "output" in payload && Array.isArray(payload.output) ? payload.output : [];

  for (const item of output) {
    if (!item || typeof item !== "object" || !("content" in item) || !Array.isArray(item.content)) {
      continue;
    }

    for (const content of item.content) {
      if (content && typeof content === "object" && "text" in content && typeof content.text === "string") {
        return content.text;
      }
    }
  }

  return null;
}

function extractJsonObject(text: string) {
  const trimmed = text.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return trimmed;
  }

  return trimmed.slice(start, end + 1);
}

function isVetSummaryPayload(value: unknown): value is VetSummaryPayload {
  return Boolean(value && typeof value === "object" && ("overview" in value || "timeline" in value || "questionsForVet" in value));
}

function normalizeSections(payload: VetSummaryPayload): NonNullable<VetSummaryResult["sections"]> {
  const overview = normalizeText(payload.overview, 900);

  return {
    overview: UNSAFE_SUMMARY_LANGUAGE.test(overview)
      ? "Recorded observations include recent memories and care notes from the selected period. This summary keeps the notes organized for a veterinary conversation."
      : overview,
    timeline: normalizeList(payload.timeline),
    appetiteNotes: normalizeList(payload.appetiteNotes),
    energyBehaviorNotes: normalizeList(payload.energyBehaviorNotes),
    vetVisitNotes: normalizeList(payload.vetVisitNotes),
    otherObservations: normalizeList(payload.otherObservations),
    questionsForVet: normalizeList(payload.questionsForVet).map((question) => (question.endsWith("?") ? question : `${question}?`))
  };
}

function normalizeText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeText(item, 180))
    .filter(Boolean)
    .filter((item) => !UNSAFE_SUMMARY_LANGUAGE.test(item))
    .slice(0, 8);
}

function hasUnsafeLanguage(sections: NonNullable<VetSummaryResult["sections"]>) {
  return [
    sections.overview,
    ...sections.timeline,
    ...sections.appetiteNotes,
    ...sections.energyBehaviorNotes,
    ...sections.vetVisitNotes,
    ...sections.otherObservations,
    ...sections.questionsForVet
  ].some((text) => UNSAFE_SUMMARY_LANGUAGE.test(text));
}
