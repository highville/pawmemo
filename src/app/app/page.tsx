import { ImagePlus, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { createMemory } from "@/app/app/actions";
import { AppShell } from "@/components/app-shell";
import { MemoryCard } from "@/components/memory-card";
import { Card } from "@/components/ui";
import { getCurrentUser, getFirstPet, getUserMemories, toAppMemory } from "@/lib/app-data";
import { memories, pet } from "@/lib/mock-data";

type HomePageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const { user } = await getCurrentUser();
  const realPet = user ? await getFirstPet(user.id) : null;
  const realMemories = user ? (await getUserMemories(user.id)).map(toAppMemory) : [];
  const displayPetName = realPet?.name ?? pet.name;
  const displayPetAvatar = realPet?.avatar_url ?? pet.avatar;
  const ownerName = user?.email?.split("@")[0] ?? pet.owner;
  const displayMemories = realMemories.length > 0 ? realMemories.slice(0, 2) : memories.slice(0, 2);

  return (
    <AppShell active="home" petName={displayPetName} petAvatar={displayPetAvatar}>
      <section className="space-y-2">
        <h1 className="font-display text-4xl font-semibold text-primary">Good morning, {ownerName}.</h1>
        <p className="text-lg text-outline">What happened with {displayPetName} today?</p>
      </section>
      {!realPet ? (
        <Card className="bg-primary-soft/70">
          <h2 className="font-display text-2xl font-semibold text-primary">Create your first pet profile</h2>
          <p className="mt-2 leading-7 text-outline">Add a pet before saving real memories. The examples below stay here until your journal has its first note.</p>
          <Link href="/onboarding" className="mt-5 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white">
            Start onboarding
          </Link>
        </Card>
      ) : null}
      {params?.error ? <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-error">{params.error}</p> : null}
      <div className="flex flex-col gap-5">
        {displayMemories.map((memory) => (
          <MemoryCard key={memory.id} memory={memory} />
        ))}
        {realMemories.length === 0 ? <p className="text-sm font-semibold text-outline">Showing sample memories until you save your first real note.</p> : null}
        <div className="ml-auto w-11/12 rounded-2xl rounded-br-sm border border-secondary-soft bg-secondary-soft/40 p-5 text-secondary">
          <p className="flex items-start gap-2 leading-7">
            <Sparkles className="mt-1 shrink-0" size={18} />
            It might be nothing, but since Momo ate less this morning, maybe offer a favorite treat later.
          </p>
        </div>
      </div>
      <form action={createMemory} className="sticky bottom-28 z-30 rounded-2xl border border-surface-line bg-surface/90 p-4 shadow-lift backdrop-blur md:bottom-8">
        <div className="hide-scrollbar mb-3 flex gap-2 overflow-x-auto">
          {["Cute moment", "First time", "Ate less", "Vet visit"].map((chip, index) => (
            <label key={chip} className="whitespace-nowrap rounded-full border border-surface-line bg-background px-4 py-2 text-xs font-semibold text-primary">
              <input name="tag" type="radio" value={chip} defaultChecked={index === 0} className="sr-only" />
              {chip}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="rounded-full bg-surface-muted p-3 text-primary" aria-label="Add image">
            <ImagePlus size={20} />
          </button>
          <input name="body" disabled={!realPet} className="min-w-0 flex-1 border-0 border-b border-outline/40 bg-transparent px-0 py-3 focus:border-primary focus:ring-0 disabled:opacity-50" placeholder={realPet ? "Share a moment..." : "Add a pet before saving notes"} />
          <button type="submit" disabled={!realPet} className="rounded-full bg-primary p-3 text-white disabled:opacity-50" aria-label="Send">
            <Send size={18} />
          </button>
        </div>
      </form>
    </AppShell>
  );
}
