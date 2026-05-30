"use server";

import {
  AI_PROVIDER,
  AI_WEEKLY_PAW_LETTER_FEATURE,
  AI_WEEKLY_PAW_LETTER_MODEL,
  enforceAIQuota,
  estimateAICostUsd,
  logAIUsageEvent
} from "@/lib/ai-usage";
import { getCurrentUser, getFirstPet, getUserMemories } from "@/lib/app-data";

const MAX_MEMORIES_FOR_LETTER = 18;
const MAX_MEMORY_BODY_LENGTH = 320;
const UNSAFE_LETTER_LANGUAGE = /diagnos|disease|illness|treatment|medication|emergency|infection|cancer|medical condition/i;

type WeeklyLetterPayload = {
  title?: unknown;
  letter?: unknown;
  careNotes?: unknown;
};

export type WeeklyLetterResult = {
  ok: boolean;
  message?: string;
  title?: string;
  letter?: string;
  careNotes: string[];
  savedReportId?: string | null;
};

export async function generateWeeklyPawLetter(): Promise<WeeklyLetterResult> {
  const { supabase, user } = await getCurrentUser();

  if (!user) {
    return {
      ok: false,
      message: "Please sign in before generating a Weekly Paw Letter.",
      careNotes: []
    };
  }

  const pet = await getFirstPet(user.id);

  if (!pet) {
    return {
      ok: false,
      message: "Create a pet profile first, then PawMemo can write a weekly letter.",
      careNotes: []
    };
  }

  const memories = await getUserMemories(user.id);
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentMemories = memories
    .filter((memory) => new Date(memory.occurred_at).getTime() >= since.getTime())
    .slice(0, MAX_MEMORIES_FOR_LETTER);

  if (recentMemories.length === 0) {
    return {
      ok: false,
      message: "No memories from the last 7 days yet. Add a few quick notes, then come back for a letter.",
      careNotes: []
    };
  }

  const quota = await enforceAIQuota({
    ownerId: user.id,
    feature: AI_WEEKLY_PAW_LETTER_FEATURE,
    provider: AI_PROVIDER,
    model: AI_WEEKLY_PAW_LETTER_MODEL
  });

  if (!quota.allowed) {
    return {
      ok: false,
      message: "You've reached today's AI letter limit. Your saved memories are still available in Timeline.",
      careNotes: []
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    await logWeeklyLetterUsage({
      ownerId: user.id,
      success: false,
      errorCode: "missing_api_key"
    });

    return {
      ok: false,
      message: "Weekly Paw Letter AI is not set up yet. Your memories are still safe here.",
      careNotes: []
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: AI_WEEKLY_PAW_LETTER_MODEL,
        instructions: [
          "You write short, warm Weekly Paw Letters for a private pet journaling app.",
          "Do not diagnose. Do not infer disease. Do not provide medical or treatment advice.",
          "Care-related mentions must be neutral, note-based observations, not instructions.",
          "Safe care wording can say a pattern may be worth keeping an eye on.",
          "Mention photo memories only as memories with photos; never analyze image contents.",
          "Keep the letter gentle, emotionally warm, and concise for mobile reading.",
          "Return only the requested JSON shape."
        ].join(" "),
        input: JSON.stringify({
          petName: pet.name,
          petType: pet.species,
          dateRange: {
            days: 7,
            since: since.toISOString()
          },
          memories: recentMemories.map((memory) => ({
            occurredAt: memory.occurred_at,
            body: memory.body.slice(0, MAX_MEMORY_BODY_LENGTH),
            tag: memory.savedTag,
            hasPhoto: Boolean(memory.signedImageUrl || memory.image_url)
          }))
        }),
        text: {
          format: {
            type: "json_schema",
            name: "pawmemo_weekly_paw_letter",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                title: {
                  type: "string",
                  maxLength: 80
                },
                letter: {
                  type: "string",
                  maxLength: 1400
                },
                careNotes: {
                  type: "array",
                  maxItems: 3,
                  items: {
                    type: "string",
                    maxLength: 160
                  }
                }
              },
              required: ["title", "letter", "careNotes"]
            }
          }
        },
        reasoning: {
          effort: "minimal"
        },
        max_output_tokens: 900
      })
    });

    if (!response.ok) {
      await logWeeklyLetterUsage({
        ownerId: user.id,
        success: false,
        errorCode: `provider_http_${response.status}`
      });

      return {
        ok: false,
        message: "Weekly Paw Letter is unavailable right now. Please try again later.",
        careNotes: []
      };
    }

    const payload = await response.json();
    const usage = extractUsage(payload);
    const parsed = parseWeeklyLetterJson(payload);

    if (!parsed) {
      await logWeeklyLetterUsage({
        ownerId: user.id,
        success: false,
        errorCode: "invalid_response",
        ...usage
      });

      return {
        ok: false,
        message: "The letter came back in an unexpected format. Please try again later.",
        careNotes: []
      };
    }

    const title = normalizeText(parsed.title, 80);
    const letter = normalizeText(parsed.letter, 1400);
    const careNotes = normalizeCareNotes(parsed.careNotes);

    if (!letter || UNSAFE_LETTER_LANGUAGE.test(`${title} ${letter} ${careNotes.join(" ")}`)) {
      await logWeeklyLetterUsage({
        ownerId: user.id,
        success: false,
        errorCode: "unsafe_response",
        ...usage
      });

      return {
        ok: false,
        message: "The letter needs a gentler rewrite. Please try again.",
        careNotes: []
      };
    }

    await logWeeklyLetterUsage({
      ownerId: user.id,
      success: true,
      ...usage
    });

    const fallbackTitle = `A gentle week with ${pet.name}`;
    const reportTitle = title || fallbackTitle;
    const saveResult = await supabase
      .from("generated_reports")
      .insert({
        owner_id: user.id,
        pet_id: pet.id,
        report_type: "weekly_paw_letter",
        title: reportTitle,
        content: formatWeeklyReportContent(reportTitle, letter, careNotes),
        period_start: toDateOnly(since),
        period_end: toDateOnly(new Date()),
        source_memory_count: recentMemories.length,
        source_care_signal_count: 0,
        included_photo_records: recentMemories.some((memory) => memory.signedImageUrl || memory.image_url),
        model: AI_WEEKLY_PAW_LETTER_MODEL
      })
      .select("id")
      .single();

    return {
      ok: true,
      title: reportTitle,
      letter,
      careNotes,
      savedReportId: saveResult.data?.id ?? null,
      message: saveResult.error ? "Letter generated, but it could not be saved to report history yet." : undefined
    };
  } catch {
    await logWeeklyLetterUsage({
      ownerId: user.id,
      success: false,
      errorCode: "request_failed"
    });

    return {
      ok: false,
      message: "Weekly Paw Letter is unavailable right now. Please try again later.",
      careNotes: []
    };
  }
}

function formatWeeklyReportContent(title: string, letter: string, careNotes: string[]) {
  return [
    title,
    "",
    letter,
    ...(careNotes.length > 0 ? ["", "Gentle notes", ...careNotes.map((note) => `- ${note}`)] : [])
  ].join("\n");
}

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function logWeeklyLetterUsage(input: {
  ownerId: string;
  success: boolean;
  errorCode?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
}) {
  await logAIUsageEvent({
    ownerId: input.ownerId,
    feature: AI_WEEKLY_PAW_LETTER_FEATURE,
    provider: AI_PROVIDER,
    model: AI_WEEKLY_PAW_LETTER_MODEL,
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    totalTokens: input.totalTokens,
    success: input.success,
    errorCode: input.errorCode
  });

  estimateAICostUsd({
    model: AI_WEEKLY_PAW_LETTER_MODEL,
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

function parseWeeklyLetterJson(payload: unknown) {
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

    return parsed as WeeklyLetterPayload;
  } catch {
    return null;
  }
}

function extractParsedOutput(payload: unknown): WeeklyLetterPayload | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("parsed" in payload && isWeeklyLetterPayload(payload.parsed)) {
    return payload.parsed;
  }

  const output = "output" in payload && Array.isArray(payload.output) ? payload.output : [];

  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    if ("parsed" in item && isWeeklyLetterPayload(item.parsed)) {
      return item.parsed;
    }

    if (!("content" in item) || !Array.isArray(item.content)) {
      continue;
    }

    for (const content of item.content) {
      if (content && typeof content === "object" && "parsed" in content && isWeeklyLetterPayload(content.parsed)) {
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

function isWeeklyLetterPayload(value: unknown): value is WeeklyLetterPayload {
  return Boolean(value && typeof value === "object" && ("letter" in value || "title" in value || "careNotes" in value));
}

function normalizeText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeCareNotes(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((note) => (typeof note === "string" ? note.trim() : ""))
    .filter(Boolean)
    .filter((note) => !UNSAFE_LETTER_LANGUAGE.test(note))
    .map((note) => note.slice(0, 160))
    .slice(0, 3);
}
