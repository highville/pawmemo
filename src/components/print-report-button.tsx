"use client";

import { Printer } from "lucide-react";

export function PrintReportButton() {
  return (
    <div className="print-hide flex flex-col gap-2 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto"
      >
        <Printer size={16} />
        Print / Save as PDF
      </button>
      <p className="text-sm font-semibold leading-6 text-outline">Use your browser&apos;s print dialog to save this report as a PDF.</p>
    </div>
  );
}
