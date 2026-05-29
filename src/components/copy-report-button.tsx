"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyReportButton({ content }: { content: string }) {
  const [message, setMessage] = useState<string | null>(null);

  async function handleCopy() {
    try {
      await copyText(content);
      setMessage("Copied.");
    } catch {
      setMessage("Copy failed. You can select the report text manually.");
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-outline/30 bg-surface px-4 py-3 text-sm font-semibold text-primary transition hover:bg-surface-muted sm:w-auto"
      >
        {message === "Copied." ? <Check size={16} /> : <Copy size={16} />}
        Copy report
      </button>
      {message ? <p className="text-sm font-semibold text-outline">{message}</p> : null}
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
