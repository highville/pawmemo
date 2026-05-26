import { Search } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MemoryCard } from "@/components/memory-card";
import { Card, PageHeader } from "@/components/ui";
import { getCurrentUser, getFirstPet, getUserMemories, toAppMemory } from "@/lib/app-data";

export default async function TimelinePage() {
  const { user } = await getCurrentUser();
  const realPet = user ? await getFirstPet(user.id) : null;
  const realMemories = user ? (await getUserMemories(user.id)).map(toAppMemory) : [];
  const displayPetName = realPet?.name ?? "your pet";

  return (
    <AppShell active="timeline" petName={displayPetName} petAvatar={realPet?.avatar_url ?? null}>
      <PageHeader
        title="Memory Timeline"
        body={realPet ? `A chronological sanctuary of your moments with ${displayPetName}.` : "Your saved notes will live here after you create a pet profile."}
      />
      <section className="relative">
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-outline" size={20} />
        <input
          className="w-full border-0 border-b border-primary bg-transparent py-4 pl-8 text-lg text-primary placeholder:text-outline focus:border-primary focus:ring-0"
          placeholder="Search memories, symptoms, or moments"
        />
      </section>
      {!realPet ? (
        <Card className="bg-primary-soft/70">
          <h2 className="font-display text-2xl font-semibold text-primary">Create a pet profile first</h2>
          <p className="mt-2 leading-7 text-outline">Timeline entries are connected to a pet, so start with the companion this journal belongs to.</p>
          <Link href="/onboarding" className="mt-5 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white">
            Create pet profile
          </Link>
        </Card>
      ) : realMemories.length === 0 ? (
        <Card className="bg-primary-soft/70">
          <h2 className="font-display text-2xl font-semibold text-primary">No saved memories yet</h2>
          <p className="mt-2 leading-7 text-outline">Start with one quick note from Home. Your first saved memory will appear here right away.</p>
          <Link href="/app" className="mt-5 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white">
            Write first note
          </Link>
        </Card>
      ) : null}
      <div className="relative space-y-6 before:absolute before:left-5 before:top-0 before:h-full before:w-px before:bg-surface-line md:before:left-1/2">
        {realMemories.map((memory, index) => {
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
