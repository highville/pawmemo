import { createSupabaseServerClient } from "@/lib/supabase/server";

export const AI_PROVIDER = "openai";
export const OPENAI_NANO_MODEL = "gpt-5-nano";
export const OPENAI_FALLBACK_MINI_MODEL = "gpt-4.1-mini";
export const AI_TAG_SUGGESTION_MODEL = OPENAI_NANO_MODEL;
export const AI_TAG_SUGGESTION_FEATURE = "tag_suggestions";

type UsageTokens = {
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
};

type LogAIUsageEventInput = UsageTokens & {
  ownerId: string;
  feature: string;
  provider: string;
  model: string;
  success: boolean;
  errorCode?: string | null;
};

type Pricing = {
  inputPerMillion: number;
  outputPerMillion: number;
};

const MODEL_PRICING_USD: Record<string, Pricing> = {
  "gpt-5-nano": {
    inputPerMillion: 0.05,
    outputPerMillion: 0.4
  },
  "gpt-4.1-mini": {
    inputPerMillion: 0.8,
    outputPerMillion: 3.2
  }
};

export async function logAIUsageEvent(input: LogAIUsageEventInput) {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.from("ai_usage_events").insert({
      owner_id: input.ownerId,
      feature: input.feature,
      provider: input.provider,
      model: input.model,
      input_tokens: input.inputTokens ?? null,
      output_tokens: input.outputTokens ?? null,
      total_tokens: input.totalTokens ?? null,
      success: input.success,
      error_code: input.errorCode ?? null
    });
  } catch {
    // Usage logging must never block the journaling experience.
  }
}

export function estimateAICostUsd(input: UsageTokens & { model: string }) {
  const pricing = MODEL_PRICING_USD[input.model];

  if (!pricing) {
    return null;
  }

  const inputTokens = input.inputTokens ?? 0;
  const outputTokens = input.outputTokens ?? 0;

  return (inputTokens / 1_000_000) * pricing.inputPerMillion + (outputTokens / 1_000_000) * pricing.outputPerMillion;
}
