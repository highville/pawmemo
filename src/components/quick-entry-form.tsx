"use client";

import { ImagePlus, Loader2, Send, X } from "lucide-react";
import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

type QuickEntryFormProps = {
  action: (formData: FormData) => void;
  hasPet: boolean;
};

export function QuickEntryForm({ action, hasPet }: QuickEntryFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
      setMessage("Please choose a JPG, PNG, or WebP photo.");
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      event.target.value = "";
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

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!hasPet) {
      event.preventDefault();
      setMessage("Create a pet profile before saving memories.");
      return;
    }

    const body = bodyInputRef.current?.value.trim() ?? "";
    const hasPhoto = Boolean(fileInputRef.current?.files?.[0]);

    if (!body && !hasPhoto) {
      event.preventDefault();
      setMessage("Write a little note or add a photo before saving.");
      return;
    }

    setMessage(null);
  }

  return (
    <form action={action} onSubmit={handleSubmit} className="sticky bottom-28 z-30 rounded-2xl border border-surface-line bg-surface/90 p-4 shadow-lift backdrop-blur md:bottom-8">
      <div className="hide-scrollbar mb-3 flex gap-2 overflow-x-auto">
        {["Cute moment", "First time", "Ate less", "Vet visit"].map((chip, index) => (
          <label key={chip} className="whitespace-nowrap rounded-full border border-surface-line bg-background px-4 py-2 text-xs font-semibold text-primary">
            <input name="tag" type="radio" value={chip} defaultChecked={index === 0} className="sr-only" />
            {chip}
          </label>
        ))}
      </div>
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
      <div className="flex items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-surface-muted px-3 py-3 text-xs font-semibold text-primary" aria-label="Add photo">
          <ImagePlus size={20} />
          <span className="hidden sm:inline">Add photo</span>
          <input ref={fileInputRef} name="photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={!hasPet} onChange={handlePhotoChange} className="sr-only" />
        </label>
        <input ref={bodyInputRef} name="body" disabled={!hasPet} className="min-w-0 flex-1 border-0 border-b border-outline/40 bg-transparent px-0 py-3 focus:border-primary focus:ring-0 disabled:opacity-50" placeholder={hasPet ? "Share a moment..." : "Create a pet first"} />
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
