"use client";

import { Trash2, X } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";

export function DeleteReportButton({ action }: { action: () => void }) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isConfirming) {
    return (
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-error transition hover:bg-red-100 sm:w-auto"
      >
        <Trash2 size={16} />
        Delete report
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-red-100 bg-red-50 p-4">
      <div className="space-y-1">
        <p className="font-semibold text-error">Delete this saved report?</p>
        <p className="text-sm leading-6 text-outline">This will delete this saved report. Your original memories will not be deleted.</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <form action={action}>
          <ConfirmDeleteButton />
        </form>
        <button
          type="button"
          onClick={() => setIsConfirming(false)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-surface px-4 py-3 text-sm font-semibold text-primary transition hover:bg-surface-muted sm:w-auto"
        >
          <X size={16} />
          Cancel
        </button>
      </div>
    </div>
  );
}

function ConfirmDeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-error px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
    >
      <Trash2 size={16} />
      {pending ? "Deleting..." : "Delete saved report"}
    </button>
  );
}
