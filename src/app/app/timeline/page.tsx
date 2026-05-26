import { Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MemoryCard } from "@/components/memory-card";
import { PageHeader } from "@/components/ui";
import { memories, pet } from "@/lib/mock-data";

export default function TimelinePage() {
  return (
    <AppShell active="timeline">
      <PageHeader
        title="Memory Timeline"
        body={`A chronological sanctuary of your moments with ${pet.name}.`}
      />
      <section className="relative">
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-outline" size={20} />
        <input
          className="w-full border-0 border-b border-primary bg-transparent py-4 pl-8 text-lg text-primary placeholder:text-outline focus:border-primary focus:ring-0"
          placeholder="Search memories, symptoms, or moments"
        />
      </section>
      <div className="relative space-y-6 before:absolute before:left-5 before:top-0 before:h-full before:w-px before:bg-surface-line md:before:left-1/2">
        {memories.map((memory, index) => {
          const Icon = memory.icon;
          return (
            <div key={memory.id} className="relative pl-14 md:grid md:grid-cols-2 md:gap-12 md:pl-0">
              <div className="absolute left-0 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-background bg-surface-muted text-outline md:left-1/2 md:-translate-x-1/2">
                <Icon size={18} />
              </div>
              <div className={index % 2 === 0 ? "md:col-start-1" : "md:col-start-2"}>
                <MemoryCard memory={memory} />
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
