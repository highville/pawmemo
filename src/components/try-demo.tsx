"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookHeart, CheckCircle2, NotebookPen, PawPrint, Sparkles } from "lucide-react";
import { ButtonLink, Card } from "@/components/ui";

const MAX_STEP = 3;

function cleanValue(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function makePreviewLetter(petName: string, memoryNote: string) {
  const name = cleanValue(petName) || "Your pet";
  const note = cleanValue(memoryNote) || "a small moment from today";

  return `${name} had a little moment worth remembering today.\n\nYou wrote: "${note}"\n\nPawMemo helps you keep small memories like this organized, then turn them into gentle weekly letters and vet-ready summaries when you create a private journal.`;
}

export function TryDemo() {
  const [step, setStep] = useState(1);
  const [petName, setPetName] = useState("");
  const [memoryNote, setMemoryNote] = useState("");
  const previewLetter = useMemo(() => makePreviewLetter(petName, memoryNote), [petName, memoryNote]);
  const trimmedPetName = cleanValue(petName);
  const trimmedMemoryNote = cleanValue(memoryNote);
  const canContinue = step === 1 ? trimmedPetName.length > 0 : trimmedMemoryNote.length > 0;

  function goNext() {
    if (!canContinue) {
      return;
    }

    setStep((current) => Math.min(current + 1, MAX_STEP));
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 1));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <Card className="space-y-6 bg-surface/95">
        <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
          <Sparkles size={18} />
          Try PawMemo in 10 seconds
        </div>

        <div className="flex gap-2" aria-label="Demo progress">
          {[1, 2, 3].map((item) => (
            <span
              key={item}
              className={`h-2 flex-1 rounded-full ${item <= step ? "bg-primary" : "bg-surface-line"}`}
            />
          ))}
        </div>

        {step === 1 ? (
          <section className="space-y-4">
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-semibold text-primary">What&apos;s your pet&apos;s name?</h2>
              <p className="leading-7 text-outline">Start with one name. This demo does not save anything.</p>
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-outline">Pet name</span>
              <input
                value={petName}
                onChange={(event) => setPetName(event.target.value)}
                className="w-full rounded-2xl border border-surface-line bg-surface-soft px-4 py-3 text-lg font-semibold text-primary outline-none transition focus:border-primary"
                placeholder="Momo"
                autoComplete="off"
              />
            </label>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="space-y-4">
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-semibold text-primary">Write one small moment from today.</h2>
              <p className="leading-7 text-outline">A nap, walk, meal, funny habit, or cozy little detail is enough.</p>
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-outline">Today&apos;s note</span>
              <textarea
                value={memoryNote}
                onChange={(event) => setMemoryNote(event.target.value)}
                className="min-h-36 w-full resize-none rounded-2xl border border-surface-line bg-surface-soft px-4 py-3 text-base leading-7 text-primary outline-none transition focus:border-primary"
                placeholder={`${trimmedPetName || "Momo"} played with a new toy after dinner.`}
              />
            </label>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="space-y-4">
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-semibold text-primary">Here&apos;s how it starts.</h2>
              <p className="leading-7 text-outline">This is a template preview. Create a journal when you&apos;re ready to save real memories privately.</p>
            </div>
            <div className="rounded-2xl bg-secondary-soft/45 p-4 text-sm font-semibold leading-6 text-secondary">
              Vet-ready summaries organize notes and are not a medical diagnosis.
            </div>
          </section>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          {step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-surface-line bg-surface px-5 py-3 text-sm font-semibold text-primary transition hover:bg-surface-soft"
            >
              <ArrowLeft size={17} />
              Back
            </button>
          ) : null}
          {step < MAX_STEP ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canContinue}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-outline/40"
            >
              Continue
              <ArrowRight size={17} />
            </button>
          ) : (
            <ButtonLink href="/auth/sign-up?next=/onboarding" className="w-full sm:w-auto">
              Create your private journal <ArrowRight size={17} />
            </ButtonLink>
          )}
        </div>
      </Card>

      <div className="space-y-5">
        <Card className="space-y-4 bg-primary-soft/55">
          <div className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-primary">
              <PawPrint size={14} />
              Demo memory
            </span>
            <span className="text-xs font-semibold text-outline">Today</span>
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-primary">
              {trimmedPetName ? `${trimmedPetName}'s little moment` : "A little moment"}
            </h2>
            <p className="mt-2 leading-7 text-ink">
              {trimmedMemoryNote || "Write one small note and PawMemo will show how it could become a memory."}
            </p>
          </div>
        </Card>

        <Card className="space-y-4 bg-surface/95">
          <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
            <BookHeart size={18} />
            Sample weekly letter
          </div>
          <p className="whitespace-pre-line leading-8 text-ink">{previewLetter}</p>
        </Card>

        <div className="rounded-2xl border border-surface-line bg-surface-soft p-4 text-sm font-semibold leading-6 text-outline">
          <div className="flex gap-2">
            <CheckCircle2 className="mt-0.5 shrink-0 text-secondary" size={18} />
            <p>This demo does not save your note, upload photos, or call AI. It is only a quick preview of the PawMemo flow.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
