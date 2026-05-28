"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import type { WeeklyLetterResult } from "@/app/app/reports/weekly/actions";
import { Card } from "@/components/ui";

type WeeklyLetterGeneratorProps = {
  action: () => Promise<WeeklyLetterResult>;
  disabled?: boolean;
};

export function WeeklyLetterGenerator({ action, disabled = false }: WeeklyLetterGeneratorProps) {
  const [result, setResult] = useState<WeeklyLetterResult | null>(null);
  const [isGeneratingNow, setIsGeneratingNow] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isGenerating = isPending || isGeneratingNow;

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
          message: "Weekly Paw Letter is unavailable right now. Please try again later.",
          careNotes: []
        });
      } finally {
        setIsGeneratingNow(false);
      }
    });
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={disabled || isGenerating}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-ambient transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
        {isGenerating ? "Writing this week's letter..." : "Generate Weekly Paw Letter"}
      </button>

      {isGenerating ? (
        <p className="rounded-2xl bg-secondary-soft/40 p-4 text-sm font-semibold text-secondary">
          Gathering this week's little moments into a gentle letter.
        </p>
      ) : null}

      {result && !result.ok ? (
        <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold leading-6 text-error">
          {result.message ?? "Weekly Paw Letter is unavailable right now. Please try again later."}
        </p>
      ) : null}

      {result?.ok && result.letter ? (
        <Card className="space-y-4 bg-primary-soft/50">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-outline">Generated letter</p>
          <h2 className="font-display text-3xl font-semibold text-primary">{result.title}</h2>
          <p className="whitespace-pre-line text-lg leading-8 text-primary">{result.letter}</p>
          {result.careNotes.length > 0 ? (
            <div className="space-y-2 rounded-2xl bg-surface/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-outline">Gentle notes</p>
              {result.careNotes.map((note) => (
                <p key={note} className="text-sm leading-6 text-outline">
                  {note}
                </p>
              ))}
            </div>
          ) : null}
          <p className="text-xs font-semibold text-outline">AI generation is logged for internal usage tracking.</p>
        </Card>
      ) : null}
    </div>
  );
}
