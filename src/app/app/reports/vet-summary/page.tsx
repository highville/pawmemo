import { Download, Info, MessageCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader } from "@/components/ui";
import { careSignals, pet } from "@/lib/mock-data";

export default function VetSummaryPage() {
  return (
    <AppShell active="reports">
      <section className="text-center">
        <PageHeader title="Vet-ready Summary" body={`For ${pet.name} (Oct 1 - Oct 31)`} />
        <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white shadow-ambient">
          <Download size={18} />
          Export PDF
        </button>
      </section>
      <Card>
        <h2 className="mb-6 flex items-center gap-3 border-b border-surface-line pb-4 font-display text-2xl font-semibold text-primary">
          Care Signals
        </h2>
        <ul className="space-y-6">
          {careSignals.map((signal) => {
            const Icon = signal.icon;
            return (
              <li key={signal.title} className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary">
                  <Icon size={22} />
                </span>
                <span>
                  <span className="block text-sm font-bold uppercase tracking-[0.12em] text-primary">{signal.title}</span>
                  <span className="mt-1 block leading-7 text-outline">{signal.body}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </Card>
      <Card className="bg-primary-soft/60">
        <h2 className="mb-5 flex items-center gap-2 font-display text-2xl font-semibold text-primary">
          <MessageCircle />
          Questions for your Vet
        </h2>
        <div className="space-y-4">
          {[
            "Momo has been sleeping more during the day; is this normal for her age?",
            "Should we be concerned about the two morning vomiting episodes, given her current diet?"
          ].map((question) => (
            <p key={question} className="rounded-2xl border border-surface-line bg-surface p-5 italic leading-7 text-primary">
              &quot;{question}&quot;
            </p>
          ))}
        </div>
      </Card>
      <p className="flex items-center justify-center gap-2 border-t border-surface-line pt-8 text-center text-sm font-semibold text-outline">
        <Info size={16} />
        This is a summary of your notes, not a medical diagnosis.
      </p>
    </AppShell>
  );
}
