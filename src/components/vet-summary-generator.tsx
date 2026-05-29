"use client";

import { Check, Copy, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import type { VetSummaryResult } from "@/app/app/reports/vet-summary/actions";
import { Card } from "@/components/ui";

type VetSummaryGeneratorProps = {
  action: () => Promise<VetSummaryResult>;
  disabled?: boolean;
  dateRange: string;
  memoryCount: number;
  careSignalCount: number;
  photoMemoryCount: number;
};

type SummaryListKey = Exclude<keyof NonNullable<VetSummaryResult["sections"]>, "overview">;

const SECTION_LABELS: Array<{
  key: SummaryListKey;
  title: string;
}> = [
  { key: "timeline", title: "Timeline of notable notes" },
  { key: "appetiteNotes", title: "Appetite / eating-related notes" },
  { key: "energyBehaviorNotes", title: "Energy / behavior-related notes" },
  { key: "vetVisitNotes", title: "Vet visit-related notes" },
  { key: "otherObservations", title: "Other observations" },
  { key: "questionsForVet", title: "Questions to consider asking the vet" }
];

export function VetSummaryGenerator({
  action,
  disabled = false,
  dateRange,
  memoryCount,
  careSignalCount,
  photoMemoryCount
}: VetSummaryGeneratorProps) {
  const [result, setResult] = useState<VetSummaryResult | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [isGeneratingNow, setIsGeneratingNow] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isGenerating = isPending || isGeneratingNow;
  const hasSummary = Boolean(result?.ok && result.sections);

  function handleGenerate() {
    if (disabled || isGenerating) {
      return;
    }

    setResult(null);
    setCopyMessage(null);
    setIsGeneratingNow(true);

    startTransition(async () => {
      try {
        const nextResult = await action();
        setResult(nextResult);
      } catch {
        setResult({
          ok: false,
          message: "Vet-ready Summary is unavailable right now. Please try again later.",
          sections: null
        });
      } finally {
        setIsGeneratingNow(false);
      }
    });
  }

  async function handleCopy() {
    if (!result?.ok || !result.sections) {
      return;
    }

    try {
      await copyText(formatSummaryForCopy(result.sections));
      setCopyMessage("Copied.");
    } catch {
      setCopyMessage("Copy failed. You can select the summary text manually.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={disabled || isGenerating}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-ambient transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {isGenerating ? "Organizing notes..." : hasSummary ? "Regenerate summary" : "Generate Vet-ready Summary"}
        </button>
        {hasSummary ? (
          <p className="text-sm leading-6 text-outline">
            Regenerating will replace the summary shown here for this session.
          </p>
        ) : null}
      </div>

      {isGenerating ? (
        <p className="rounded-2xl bg-secondary-soft/40 p-4 text-sm font-semibold text-secondary">
          Organizing recent notes into a neutral summary.
        </p>
      ) : null}

      {result && !result.ok ? (
        <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold leading-6 text-error">
          {result.message ?? "Vet-ready Summary is unavailable right now. Please try again later."}
        </p>
      ) : null}

      {result?.ok ? (
        <p className={`rounded-2xl p-4 text-sm font-semibold leading-6 ${result.message ? "bg-red-50 text-error" : "bg-secondary-soft/40 text-secondary"}`}>
          {result.message ?? "Saved to report history."}
        </p>
      ) : null}

      {result?.ok && result.sections ? (
        <Card className="space-y-5 bg-primary-soft/50">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="rounded-full bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-outline">
                Vet-ready Summary
              </p>
              <p className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-semibold text-secondary">{dateRange}</p>
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-semibold leading-tight text-primary">Summary for your vet visit</h2>
              <p className="text-sm leading-6 text-outline">
                Organized from {memoryCount} {memoryCount === 1 ? "memory" : "memories"} and {careSignalCount} care {careSignalCount === 1 ? "signal" : "signals"}.
                {photoMemoryCount > 0 ? " Includes photo records from this period." : ""}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-surface/85 p-5 shadow-ambient">
            <div className="mb-4 flex items-start gap-2 rounded-2xl bg-secondary-soft/45 p-4 text-sm font-semibold leading-6 text-secondary">
              <ShieldCheck size={18} className="mt-0.5 shrink-0" />
              <p>This summary organizes your notes and is not a medical diagnosis.</p>
            </div>
            <section className="space-y-2">
              <h3 className="font-display text-2xl font-semibold text-primary">Overview</h3>
              <p className="text-base leading-8 text-primary">{result.sections.overview}</p>
            </section>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-outline/30 bg-surface px-4 py-3 text-sm font-semibold text-primary transition hover:bg-surface-muted sm:w-auto"
            >
              {copyMessage === "Copied." ? <Check size={16} /> : <Copy size={16} />}
              Copy summary
            </button>
            {copyMessage ? <p className="text-sm font-semibold text-outline">{copyMessage}</p> : null}
          </div>

          <div className="grid gap-4">
            {SECTION_LABELS.map(({ key, title }) => {
              const items = result.sections?.[key] ?? [];

              return (
                <section key={key} className="rounded-2xl bg-surface/85 p-5 shadow-ambient">
                  <h3 className="font-display text-xl font-semibold text-primary">{title}</h3>
                  {items.length > 0 ? (
                    <ul className="mt-3 list-disc space-y-3 pl-5">
                      {items.map((item) => (
                        <li key={item} className="text-base leading-7 text-outline">
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 leading-7 text-outline">No specific notes in this category.</p>
                  )}
                </section>
              );
            })}
          </div>

          <p className="text-xs font-semibold text-outline">AI generation is logged for internal usage tracking.</p>
        </Card>
      ) : null}
    </div>
  );
}

function formatSummaryForCopy(sections: NonNullable<VetSummaryResult["sections"]>) {
  const list = (title: string, items: string[]) => [
    title,
    ...(items.length > 0 ? items.map((item) => `- ${item}`) : ["- No specific notes in this category."])
  ].join("\n");

  return [
    "Vet-ready Summary",
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

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall back for browser surfaces where the async clipboard API is blocked.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, text.length);

  try {
    const didCopy = document.execCommand("copy");

    if (!didCopy) {
      throw new Error("Copy command failed.");
    }
  } finally {
    document.body.removeChild(textarea);
  }
}
