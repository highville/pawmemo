import { ImagePlus, Send, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MemoryCard } from "@/components/memory-card";
import { memories, pet } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <AppShell active="home">
      <section className="space-y-2">
        <h1 className="font-display text-4xl font-semibold text-primary">Good morning, {pet.owner}.</h1>
        <p className="text-lg text-outline">What happened with {pet.name} today?</p>
      </section>
      <div className="flex flex-col gap-5">
        {memories.slice(0, 2).map((memory) => (
          <MemoryCard key={memory.id} memory={memory} />
        ))}
        <div className="ml-auto w-11/12 rounded-2xl rounded-br-sm border border-secondary-soft bg-secondary-soft/40 p-5 text-secondary">
          <p className="flex items-start gap-2 leading-7">
            <Sparkles className="mt-1 shrink-0" size={18} />
            It might be nothing, but since Momo ate less this morning, maybe offer a favorite treat later.
          </p>
        </div>
      </div>
      <section className="sticky bottom-28 z-30 rounded-2xl border border-surface-line bg-surface/90 p-4 shadow-lift backdrop-blur md:bottom-8">
        <div className="hide-scrollbar mb-3 flex gap-2 overflow-x-auto">
          {["Cute moment", "First time", "Ate less", "Vet visit"].map((chip) => (
            <button key={chip} className="whitespace-nowrap rounded-full border border-surface-line bg-background px-4 py-2 text-xs font-semibold text-primary">
              {chip}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-full bg-surface-muted p-3 text-primary" aria-label="Add image">
            <ImagePlus size={20} />
          </button>
          <input className="min-w-0 flex-1 border-0 border-b border-outline/40 bg-transparent px-0 py-3 focus:border-primary focus:ring-0" placeholder="Share a moment..." />
          <button className="rounded-full bg-primary p-3 text-white" aria-label="Send">
            <Send size={18} />
          </button>
        </div>
      </section>
    </AppShell>
  );
}
