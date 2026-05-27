"use server";

const QUICK_TAGS = ["Cute moment", "First time", "Ate less", "Vet visit"];
const MAX_MEMORY_TEXT_LENGTH = 1200;

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
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      message: "AI suggestions are not set up yet. You can keep saving memories manually.",
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

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        instructions: [
          "You suggest gentle memory tags for a private pet journaling app.",
          "Do not diagnose. Do not give medical advice. Do not infer disease.",
          "Care signal candidates must be neutral, note-based observations only.",
          "Prefer the known quick tags when appropriate: Cute moment, First time, Ate less, Vet visit.",
          "You may suggest additional concise user-owned tag candidates when useful.",
          "Return only the requested JSON shape."
        ].join(" "),
        input: JSON.stringify({
          memoryText,
          selectedQuickTag: selectedTag,
          knownQuickTags: QUICK_TAGS
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
                  maxItems: 4,
                  items: {
                    type: "string",
                    maxLength: 48
                  }
                },
                careSignalCandidates: {
                  type: "array",
                  maxItems: 2,
                  items: {
                    type: "string",
                    maxLength: 160
                  }
                }
              },
              required: ["suggestedTags", "careSignalCandidates"]
            }
          }
        },
        max_output_tokens: 300
      })
    });

    if (!response.ok) {
      return {
        ok: false,
        message: "AI suggestions are unavailable right now. You can still save this memory manually.",
        suggestedTags: [],
        careSignalCandidates: []
      };
    }

    const payload = await response.json();
    const parsed = parseResponseJson(payload);

    if (!parsed) {
      return {
        ok: false,
        message: "AI suggestions came back in an unexpected format. You can still save this memory manually.",
        suggestedTags: [],
        careSignalCandidates: []
      };
    }

    return {
      ok: true,
      suggestedTags: normalizeTags(parsed.suggestedTags),
      careSignalCandidates: normalizeCareSignals(parsed.careSignalCandidates)
    };
  } catch {
    return {
      ok: false,
      message: "AI suggestions are unavailable right now. You can still save this memory manually.",
      suggestedTags: [],
      careSignalCandidates: []
    };
  }
}

function parseResponseJson(payload: unknown) {
  const text = extractOutputText(payload);

  if (!text) {
    return null;
  }

  try {
    const parsed = JSON.parse(text);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed as {
      suggestedTags?: unknown;
      careSignalCandidates?: unknown;
    };
  } catch {
    return null;
  }
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

function normalizeTags(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
        .filter(Boolean)
        .map((tag) => tag.slice(0, 48))
    )
  ).slice(0, 4);
}

function normalizeCareSignals(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((signal) => (typeof signal === "string" ? signal.trim() : ""))
    .filter(Boolean)
    .filter((signal) => !/diagnos|disease|illness|treatment|medication|emergency/i.test(signal))
    .map((signal) => signal.slice(0, 160))
    .slice(0, 2);
}
