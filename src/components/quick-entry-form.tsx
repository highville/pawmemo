"use client";

import { ImagePlus, Loader2, Send, Sparkles, X } from "lucide-react";
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import type { TagSuggestionResult } from "@/app/app/ai-actions";

const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const QUICK_TAGS = ["Cute moment", "First time", "Ate less", "Vet visit"];

type QuickEntryFormProps = {
  action: (formData: FormData) => void;
  suggestAction: (input: { memoryText: string; selectedTag?: string | null }) => Promise<TagSuggestionResult>;
  hasPet: boolean;
};

export function QuickEntryForm({ action, suggestAction, hasPet }: QuickEntryFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyInputRef = useRef<HTMLInputElement>(null);
  const isSuggestingRef = useRef(false);
  const suggestionCacheRef = useRef<Record<string, TagSuggestionResult>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [careSignals, setCareSignals] = useState<string[]>([]);
  const [isSuggestingNow, setIsSuggestingNow] = useState(false);
  const [isSuggesting, startSuggesting] = useTransition();
  const isSuggestionPending = isSuggesting || isSuggestingNow;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setPhotoName(null);

    if (!file) {
      return;
    }

    if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
      event.target.value = "";
      setStatusMessage(null);
      setMessage("Please choose a JPG, PNG, or WebP photo.");
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      event.target.value = "";
      setStatusMessage(null);
      setMessage("Please choose a photo under 5 MB.");
      return;
    }

    setMessage(null);
    setPhotoName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function removePhoto() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setPhotoName(null);
    setMessage(null);
    setStatusMessage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!hasPet) {
      event.preventDefault();
      setStatusMessage(null);
      setMessage("Create a pet profile before saving memories.");
      return;
    }

    const body = bodyInputRef.current?.value.trim() ?? "";
    const hasPhoto = Boolean(fileInputRef.current?.files?.[0]);

    if (!body && !hasPhoto) {
      event.preventDefault();
      setStatusMessage(null);
      setMessage("Write a little note or add a photo before saving.");
      return;
    }

    setMessage(null);
    setStatusMessage(null);
  }

  function toggleTag(tag: string) {
    setSelectedTag((current) => (current === tag ? null : tag));
  }

  function handleSuggestTags() {
    const memoryText = bodyInputRef.current?.value.trim() ?? "";

    if (isSuggestingRef.current) {
      return;
    }

    setSuggestions([]);
    setCareSignals([]);

    if (!memoryText) {
      setStatusMessage(null);
      setMessage("Write a short note first, then PawMemo can suggest gentle tags.");
      return;
    }

    const cacheKey = memoryText.toLowerCase();
    const cachedResult = suggestionCacheRef.current[cacheKey];

    if (cachedResult) {
      if (cachedResult.ok) {
        setMessage(null);
        setStatusMessage("Showing the last suggestions for this note.");
        setSuggestions(cachedResult.suggestedTags);
        setCareSignals(cachedResult.careSignalCandidates);
      } else {
        setStatusMessage(null);
        setMessage(cachedResult.message ?? "AI suggestions are unavailable right now. You can still save manually.");
      }

      return;
    }

    isSuggestingRef.current = true;
    setIsSuggestingNow(true);
    setMessage(null);
    setStatusMessage("Looking for gentle tag ideas...");

    startSuggesting(async () => {
      try {
        const result = await suggestAction({
          memoryText,
          selectedTag
        });

        if (result.ok) {
          suggestionCacheRef.current[cacheKey] = result;
        }

        isSuggestingRef.current = false;
        setIsSuggestingNow(false);

        if (!result.ok) {
          setStatusMessage(null);
          setMessage(result.message ?? "AI suggestions are unavailable right now. You can still save manually.");
          return;
        }

        setMessage(null);
        setStatusMessage("Choose a suggestion below, or keep your own tag.");
        setSuggestions(result.suggestedTags);
        setCareSignals(result.careSignalCandidates);
      } catch {
        isSuggestingRef.current = false;
        setIsSuggestingNow(false);
        setStatusMessage(null);
        setMessage("AI suggestions are unavailable right now. You can still save manually.");
      }
    });
  }

  return (
    <form action={action} onSubmit={handleSubmit} className="sticky bottom-28 z-30 rounded-2xl border border-surface-line bg-surface/90 p-4 shadow-lift backdrop-blur md:bottom-8">
      <div className="hide-scrollbar mb-3 flex gap-2 overflow-x-auto">
        <input type="hidden" name="tag" value={selectedTag ?? ""} />
        {QUICK_TAGS.map((chip) => (
          <button
            key={chip}
            type="button"
            aria-pressed={selectedTag === chip}
            onClick={() => toggleTag(chip)}
            className="whitespace-nowrap rounded-full border border-surface-line bg-background px-4 py-2 text-xs font-semibold text-primary transition aria-pressed:border-secondary aria-pressed:bg-secondary-soft aria-pressed:text-secondary"
          >
            {chip}
          </button>
        ))}
      </div>
      {hasPet ? <p className="mb-3 text-xs font-semibold text-outline">Choose a quick tag if it fits, or use sparkles for optional AI tag ideas.</p> : null}
      {previewUrl ? (
        <div className="mb-3 flex items-center gap-3 rounded-2xl border border-primary-soft bg-primary-soft/40 p-2">
          <img src={previewUrl} alt="Selected memory preview" className="h-16 w-16 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-primary">{photoName}</p>
            <p className="text-xs text-outline">One photo will be attached to this memory.</p>
          </div>
          <button type="button" onClick={removePhoto} className="rounded-full bg-surface p-2 text-outline" aria-label="Remove selected photo">
            <X size={16} />
          </button>
        </div>
      ) : null}
      {message ? <p className="mb-3 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-error">{message}</p> : null}
      {statusMessage ? <p className="mb-3 rounded-2xl bg-secondary-soft/40 p-3 text-sm font-semibold text-secondary">{statusMessage}</p> : null}
      {suggestions.length > 0 || careSignals.length > 0 ? (
        <div className="mb-3 rounded-2xl border border-secondary-soft bg-secondary-soft/30 p-3">
          {suggestions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={selectedTag === tag}
                  onClick={() => toggleTag(tag)}
                  className="rounded-full border border-transparent bg-surface px-3 py-2 text-xs font-semibold text-secondary transition aria-pressed:border-secondary aria-pressed:bg-secondary aria-pressed:text-white"
                >
                  {tag}
                </button>
              ))}
            </div>
          ) : null}
          {careSignals.length > 0 ? (
            <div className="mt-3 space-y-1 text-xs leading-5 text-outline">
              {careSignals.map((signal) => (
                <p key={signal}>{signal}</p>
              ))}
            </div>
          ) : null}
          <p className="mt-3 text-[11px] font-semibold text-outline">AI suggestions are optional and logged for usage tracking.</p>
        </div>
      ) : null}
      <div className="flex items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-surface-muted px-3 py-3 text-xs font-semibold text-primary" aria-label="Add photo">
          <ImagePlus size={20} />
          <span className="hidden sm:inline">Add photo</span>
          <input ref={fileInputRef} name="photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={!hasPet} onChange={handlePhotoChange} className="sr-only" />
        </label>
        <input ref={bodyInputRef} name="body" disabled={!hasPet} className="min-w-0 flex-1 border-0 border-b border-outline/40 bg-transparent px-0 py-3 focus:border-primary focus:ring-0 disabled:opacity-50" placeholder={hasPet ? "Share a moment..." : "Create a pet first"} />
        <button type="button" onClick={handleSuggestTags} disabled={!hasPet || isSuggestionPending} className="rounded-full bg-secondary-soft p-3 text-secondary disabled:opacity-50" aria-label={isSuggestionPending ? "Suggesting tags" : "Suggest tags"}>
          {isSuggestionPending ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
        </button>
        <SubmitButton disabled={!hasPet} />
      </div>
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={disabled || pending} className="rounded-full bg-primary p-3 text-white disabled:opacity-50" aria-label={pending ? "Saving" : "Send"}>
      {pending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
    </button>
  );
}
