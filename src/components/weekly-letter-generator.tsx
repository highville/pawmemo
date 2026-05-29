"use client";

import { Check, Copy, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import type { WeeklyLetterResult } from "@/app/app/reports/weekly/actions";
import { Card } from "@/components/ui";

type WeeklyLetterGeneratorProps = {
  action: () => Promise<WeeklyLetterResult>;
  disabled?: boolean;
  dateRange: string;
  memoryCount: number;
  photoMemoryCount: number;
};

export function WeeklyLetterGenerator({
  action,
  disabled = false,
  dateRange,
  memoryCount,
  photoMemoryCount
}: WeeklyLetterGeneratorProps) {
  const [result, setResult] = useState<WeeklyLetterResult | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [isGeneratingNow, setIsGeneratingNow] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isGenerating = isPending || isGeneratingNow;
  const hasLetter = Boolean(result?.ok && result.letter);

  function handleGenerate() {
    if (disabled || isGenerating) {
      return;
    }

    setCopyMessage(null);
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

  async function handleCopy() {
    if (!result?.ok || !result.letter) {
      return;
    }

    try {
      await copyText(result.letter);
      setCopyMessage("Copied.");
    } catch {
      setCopyMessage("Copy failed. You can select the letter text manually.");
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
          {isGenerating ? <Loader2 size={18} className="animate-spin" /> : hasLetter ? <RefreshCw size={18} /> : <Sparkles size={18} />}
          {isGenerating ? "Writing this week's letter..." : hasLetter ? "Regenerate letter" : "Generate Weekly Paw Letter"}
        </button>
        {hasLetter ? (
          <p className="text-sm leading-6 text-outline">
            Regenerating will replace the letter shown here for this session.
          </p>
        ) : null}
      </div>

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

      {result?.ok ? (
        <p className={`rounded-2xl p-4 text-sm font-semibold leading-6 ${result.message ? "bg-red-50 text-error" : "bg-secondary-soft/40 text-secondary"}`}>
          {result.message ?? "Saved to report history."}
        </p>
      ) : null}

      {result?.ok && result.letter ? (
        <Card className="space-y-5 bg-primary-soft/50">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="rounded-full bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-outline">
                Weekly Paw Letter
              </p>
              <p className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-semibold text-secondary">{dateRange}</p>
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-semibold leading-tight text-primary">{result.title}</h2>
              <p className="text-sm leading-6 text-outline">
                Written from {memoryCount} {memoryCount === 1 ? "memory" : "memories"} this week.
                {photoMemoryCount > 0 ? " Includes photo memories from this week." : ""}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-surface/85 p-5 shadow-ambient">
            <p className="whitespace-pre-line text-base leading-8 text-primary md:text-lg">{result.letter}</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-outline/30 bg-surface px-4 py-3 text-sm font-semibold text-primary transition hover:bg-surface-muted sm:w-auto"
            >
              {copyMessage === "Copied." ? <Check size={16} /> : <Copy size={16} />}
              Copy letter
            </button>
            {copyMessage ? <p className="text-sm font-semibold text-outline">{copyMessage}</p> : null}
          </div>

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
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const didCopy = document.execCommand("copy");

    if (!didCopy) {
      throw new Error("Copy command failed.");
    }
  } finally {
    document.body.removeChild(textarea);
  }
}
