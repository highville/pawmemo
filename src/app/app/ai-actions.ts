"use server";

import {
  AI_PROVIDER,
  AI_TAG_SUGGESTION_FEATURE,
  AI_TAG_SUGGESTION_MODEL,
  enforceAIQuota,
  estimateAICostUsd,
  logAIUsageEvent
} from "@/lib/ai-usage";
import { getCurrentUser } from "@/lib/app-data";

const QUICK_TAGS = ["Cute moment", "First time", "Ate less", "Vet visit"];
const MAX_MEMORY_TEXT_LENGTH = 1200;
const UNSAFE_CARE_LANGUAGE = /diagnos|disease|illness|treatment|medication|emergency|infection|cancer|condition|symptom/i;
const UNSAFE_TAG_LANGUAGE = /diagnos|disease|illness|treatment|medication|emergency|infection|cancer|condition|symptom|sick|pain|urgent/i;
const GENERIC_TAGS = new Set(["pet", "memory", "note", "animal"]);

type ParsedSuggestionPayload = {
  suggestedTags?: unknown;
  careSignalCandidates?: unknown;
};

export type TagSuggestionResult = {
  ok: boolean;
  message?: string;
  suggestedTags: string[];
  careSignalCandidates: string[];
};

export async function suggestMemoryTags(input: {
  memoryText: string;
  selectedTag?: string | null;
}): Promise<TagSuggestionResult> {
  const { user } = await getCurrentUser();

  if (!user) {
    return {
      ok: false,
      message: "Please sign in before asking PawMemo for suggestions.",
      suggestedTags: [],
      careSignalCandidates: []
    };
  }

  const memoryText = input.memoryText.trim().slice(0, MAX_MEMORY_TEXT_LENGTH);
  const selectedTag = input.selectedTag?.trim() || null;

  if (!memoryText) {
    return {
      ok: false,
      message: "Write a short note first, then PawMemo can suggest gentle tags.",
      suggestedTags: [],
      careSignalCandidates: []
    };
  }

  const quota = await enforceAIQuota({
    ownerId: user.id,
    feature: AI_TAG_SUGGESTION_FEATURE,
    provider: AI_PROVIDER,
    model: AI_TAG_SUGGESTION_MODEL
  });

  if (!quota.allowed) {
    return {
      ok: false,
      message: "You've reached today's AI suggestion limit. You can still save memories manually.",
      suggestedTags: [],
      careSignalCandidates: []
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    await logTagSuggestionUsage({
      ownerId: user.id,
      success: false,
      errorCode: "missing_api_key"
    });

    return {
      ok: false,
      message: "AI suggestions are not set up yet. You can keep saving memories manually.",
      suggestedTags: [],
      careSignalCandidates: []
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
        model: AI_TAG_SUGGESTION_MODEL,
        instructions: [
          "You suggest gentle memory tags for a private pet journaling app.",
          "Do not diagnose. Do not give medical advice. Do not infer disease.",
          "Care signal candidates must be neutral, note-based observations only, with a short type and note.",
          "The app already has fixed manual quick tags: Cute moment, First time, Ate less, Vet visit.",
          "Do not limit your suggestions to those quick tags.",
          "Suggest 1 to 3 short contextual tags based on the note, ideally 1 to 3 words each.",
          "Good examples include Playtime, New toy, Energetic, Cozy nap, Quiet day, Cuddles, Bath day, Grooming, Fluffy moment.",
          "For care-related notes, use neutral note-based tags like Food note, Low appetite, Vet visit, or Sleepy day. Avoid scary or definitive health claims.",
          "Avoid duplicate, empty, overly generic, personal-data, diagnosis, treatment, medication, emergency, or disease tags.",
          "Return only the requested JSON shape."
        ].join(" "),
        input: JSON.stringify({
          memoryText,
          selectedQuickTag: selectedTag,
          manualQuickTags: QUICK_TAGS
        }),
        text: {
          format: {
            type: "json_schema",
            name: "pawmemo_tag_suggestions",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                suggestedTags: {
                  type: "array",
                  minItems: 1,
                  maxItems: 3,
                  items: {
                    type: "string",
                    maxLength: 32
                  }
                },
                careSignalCandidates: {
                  type: "array",
                  maxItems: 2,
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      type: {
                        type: "string",
                        maxLength: 32
                      },
                      note: {
                        type: "string",
                        maxLength: 160
                      }
                    },
                    required: ["type", "note"]
                  }
                }
              },
              required: ["suggestedTags", "careSignalCandidates"]
            }
          }
        },
        reasoning: {
          effort: "minimal"
        },
        max_output_tokens: 800
      })
    });

    if (!response.ok) {
      await logTagSuggestionUsage({
        ownerId: user.id,
        success: false,
        errorCode: `provider_http_${response.status}`
      });

      return {
        ok: false,
        message: "AI suggestions are unavailable right now. You can still save this memory manually.",
        suggestedTags: [],
        careSignalCandidates: []
      };
    }

    const payload = await response.json();
    const usage = extractUsage(payload);
    const parsed = parseResponseJson(payload);

    if (!parsed) {
      await logTagSuggestionUsage({
        ownerId: user.id,
        success: false,
        errorCode: "invalid_response",
        ...usage
      });

      return {
        ok: false,
        message: "AI suggestions came back in an unexpected format. You can still save this memory manually.",
        suggestedTags: [],
        careSignalCandidates: []
      };
    }

    await logTagSuggestionUsage({
      ownerId: user.id,
      success: true,
      ...usage
    });

    const suggestedTags = normalizeTags(parsed.suggestedTags);
    const careSignalCandidates = normalizeCareSignals(parsed.careSignalCandidates);

    if (suggestedTags.length === 0) {
      return {
        ok: false,
        message: "PawMemo could not find a safe tag suggestion for that note. You can still save it manually.",
        suggestedTags: [],
        careSignalCandidates: []
      };
    }

    return {
      ok: true,
      suggestedTags,
      careSignalCandidates
    };
  } catch {
    await logTagSuggestionUsage({
      ownerId: user.id,
      success: false,
      errorCode: "request_failed"
    });

    return {
      ok: false,
      message: "AI suggestions are unavailable right now. You can still save this memory manually.",
      suggestedTags: [],
      careSignalCandidates: []
    };
  }
}

async function logTagSuggestionUsage(input: {
  ownerId: string;
  success: boolean;
  errorCode?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
}) {
  await logAIUsageEvent({
    ownerId: input.ownerId,
    feature: AI_TAG_SUGGESTION_FEATURE,
    provider: AI_PROVIDER,
    model: AI_TAG_SUGGESTION_MODEL,
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    totalTokens: input.totalTokens,
    success: input.success,
    errorCode: input.errorCode
  });

  estimateAICostUsd({
    model: AI_TAG_SUGGESTION_MODEL,
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

function parseResponseJson(payload: unknown) {
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

    return parsed as ParsedSuggestionPayload;
  } catch {
    return null;
  }
}

function extractParsedOutput(payload: unknown): ParsedSuggestionPayload | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if ("parsed" in payload && isSuggestionPayload(payload.parsed)) {
    return payload.parsed;
  }

  const output = "output" in payload && Array.isArray(payload.output) ? payload.output : [];

  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    if ("parsed" in item && isSuggestionPayload(item.parsed)) {
      return item.parsed;
    }

    if (!("content" in item) || !Array.isArray(item.content)) {
      continue;
    }

    for (const content of item.content) {
      if (content && typeof content === "object" && "parsed" in content && isSuggestionPayload(content.parsed)) {
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

function isSuggestionPayload(value: unknown): value is ParsedSuggestionPayload {
  return Boolean(value && typeof value === "object" && ("suggestedTags" in value || "careSignalCandidates" in value));
}

function normalizeTags(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const tags: string[] = [];

  for (const rawTag of value) {
    if (typeof rawTag !== "string") {
      continue;
    }

    const tag = normalizeTagLabel(rawTag);
    const key = tag.toLowerCase();

    if (!tag || seen.has(key)) {
      continue;
    }

    seen.add(key);
    tags.push(tag);

    if (tags.length === 3) {
      break;
    }
  }

  return tags;
}

function normalizeTagLabel(value: string) {
  const tag = value
    .replace(/^#+/, "")
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 32);

  if (!tag || GENERIC_TAGS.has(tag.toLowerCase()) || UNSAFE_TAG_LANGUAGE.test(tag)) {
    return "";
  }

  const words = tag.split(" ").filter(Boolean);

  if (words.length > 3) {
    return "";
  }

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function normalizeCareSignals(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((signal) => {
      if (typeof signal === "string") {
        return signal.trim();
      }

      if (!signal || typeof signal !== "object") {
        return "";
      }

      const type = "type" in signal && typeof signal.type === "string" ? signal.type.trim() : "";
      const note = "note" in signal && typeof signal.note === "string" ? signal.note.trim() : "";

      return [type, note].filter(Boolean).join(": ");
    })
    .filter(Boolean)
    .filter((signal) => !UNSAFE_CARE_LANGUAGE.test(signal))
    .map((signal) => signal.slice(0, 160))
    .slice(0, 2);
}
