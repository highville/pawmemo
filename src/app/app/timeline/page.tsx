import { Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MemoryCard } from "@/components/memory-card";
import { Card, PageHeader } from "@/components/ui";
import { getCurrentUser, getFirstPet, getUserMemories, toAppMemory } from "@/lib/app-data";
import { memories, pet } from "@/lib/mock-data";

export default async function TimelinePage() {
  const { user } = await getCurrentUser();
  const realPet = user ? await getFirstPet(user.id) : null;
  const realMemories = user ? (await getUserMemories(user.id)).map(toAppMemory) : [];
  const displayPetName = realPet?.name ?? pet.name;
  const displayPetAvatar = realPet?.avatar_url ?? pet.avatar;
  const displayMemories = realMemories.length > 0 ? realMemories : memories;

  return (
    <AppShell active="timeline" petName={displayPetName} petAvatar={displayPetAvatar}>
      <PageHeader
        title="Memory Timeline"
        body={`A chronological sanctuary of your moments with ${displayPetName}.`}
      />
      <section className="relative">
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-outline" size={20} />
        <input
          className="w-full border-0 border-b border-primary bg-transparent py-4 pl-8 text-lg text-primary placeholder:text-outline focus:border-primary focus:ring-0"
          placeholder="Search memories, symptoms, or moments"
        />
      </section>
      {realMemories.length === 0 ? (
        <Card className="bg-primary-soft/70">
          <h2 className="font-display text-2xl font-semibold text-primary">No saved memories yet</h2>
          <p className="mt-2 leading-7 text-outline">Your real notes will appear here after you save them from Home. Sample memories are shown below so the layout still feels familiar.</p>
        </Card>
      ) : null}
      <div className="relative space-y-6 before:absolute before:left-5 before:top-0 before:h-full before:w-px before:bg-surface-line md:before:left-1/2">
        {displayMemories.map((memory, index) => {
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
