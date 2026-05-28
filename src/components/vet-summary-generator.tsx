"use client";

import { Loader2, ShieldCheck, Sparkles } from "lucide-react";
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
  const [isGeneratingNow, setIsGeneratingNow] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isGenerating = isPending || isGeneratingNow;
  const hasSummary = Boolean(result?.ok && result.sections);

  function handleGenerate() {
    if (disabled || isGenerating) {
      return;
    }

    setResult(null);
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
                {photoMemoryCount > 0 ? " Photo records are noted, but images are not analyzed." : ""}
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
              <p className="leading-7 text-primary">{result.sections.overview}</p>
            </section>
          </div>

          <div className="grid gap-4">
            {SECTION_LABELS.map(({ key, title }) => {
              const items = result.sections?.[key] ?? [];

              return (
                <section key={key} className="rounded-2xl bg-surface/85 p-5 shadow-ambient">
                  <h3 className="font-display text-xl font-semibold text-primary">{title}</h3>
                  {items.length > 0 ? (
                    <ul className="mt-3 space-y-3">
                      {items.map((item) => (
                        <li key={item} className="leading-7 text-outline">
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
