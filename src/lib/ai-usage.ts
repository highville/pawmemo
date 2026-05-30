import { createSupabaseServerClient } from "@/lib/supabase/server";

export const AI_PROVIDER = "openai";
export const OPENAI_NANO_MODEL = "gpt-5-nano";
export const OPENAI_FALLBACK_MINI_MODEL = "gpt-4.1-mini";
export const AI_TAG_SUGGESTION_MODEL = OPENAI_NANO_MODEL;
export const AI_TAG_SUGGESTION_FEATURE = "tag_suggestions";
export const AI_WEEKLY_PAW_LETTER_MODEL = OPENAI_NANO_MODEL;
export const AI_WEEKLY_PAW_LETTER_FEATURE = "weekly_paw_letter";
export const AI_VET_READY_SUMMARY_MODEL = OPENAI_NANO_MODEL;
export const AI_VET_READY_SUMMARY_FEATURE = "vet_ready_summary";
export const DEFAULT_AI_DAILY_CALL_LIMIT = 20;
export const DEFAULT_AI_MONTHLY_CALL_LIMIT = 100;

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

type EnforceAIQuotaInput = {
  ownerId: string;
  feature: string;
  provider: string;
  model: string;
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

export async function enforceAIQuota(input: EnforceAIQuotaInput) {
  const limits = getAIQuotaLimits();

  try {
    const supabase = await createSupabaseServerClient();
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [{ count: dailyCount }, { count: monthlyCount }] = await Promise.all([
      supabase
        .from("ai_usage_events")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", input.ownerId)
        .gte("created_at", startOfDay.toISOString()),
      supabase
        .from("ai_usage_events")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", input.ownerId)
        .gte("created_at", startOfMonth.toISOString())
    ]);

    if ((dailyCount ?? 0) >= limits.daily || (monthlyCount ?? 0) >= limits.monthly) {
      await logAIUsageEvent({
        ownerId: input.ownerId,
        feature: input.feature,
        provider: input.provider,
        model: input.model,
        success: false,
        errorCode: "quota_exceeded"
      });

      return {
        allowed: false,
        limits,
        dailyCount: dailyCount ?? 0,
        monthlyCount: monthlyCount ?? 0
      };
    }
  } catch {
    // Quota checks should fail open so the app remains usable if usage lookup is temporarily unavailable.
  }

  return {
    allowed: true,
    limits,
    dailyCount: null,
    monthlyCount: null
  };
}

export function getAIQuotaLimits() {
  return {
    daily: readPositiveInteger(process.env.AI_DAILY_CALL_LIMIT, DEFAULT_AI_DAILY_CALL_LIMIT),
    monthly: readPositiveInteger(process.env.AI_MONTHLY_CALL_LIMIT, DEFAULT_AI_MONTHLY_CALL_LIMIT)
  };
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

function readPositiveInteger(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
