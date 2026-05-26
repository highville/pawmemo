import { ImagePlus, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { createMemory } from "@/app/app/actions";
import { AppShell } from "@/components/app-shell";
import { MemoryCard } from "@/components/memory-card";
import { Card } from "@/components/ui";
import { getCurrentUser, getFirstPet, getUserMemories, toAppMemory } from "@/lib/app-data";

type HomePageProps = {
  searchParams?: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const { user } = await getCurrentUser();
  const realPet = user ? await getFirstPet(user.id) : null;
  const realMemories = user ? (await getUserMemories(user.id)).map(toAppMemory) : [];
  const displayPetName = realPet?.name ?? "your pet";
  const ownerName = user?.email?.split("@")[0] ?? "there";

  return (
    <AppShell active="home" petName={displayPetName} petAvatar={realPet?.avatar_url ?? null}>
      <section className="space-y-2">
        <h1 className="font-display text-4xl font-semibold text-primary">Good morning, {ownerName}.</h1>
        <p className="text-lg text-outline">{realPet ? `What happened with ${displayPetName} today?` : "Create a pet profile to begin your private journal."}</p>
      </section>
      {!realPet ? (
        <Card className="bg-primary-soft/70">
          <h2 className="font-display text-2xl font-semibold text-primary">Create your first pet profile</h2>
          <p className="mt-2 leading-7 text-outline">Add your pet once, then PawMemo can keep every note connected to the right companion.</p>
          <Link href="/onboarding" className="mt-5 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white">
            Create pet profile
          </Link>
        </Card>
      ) : null}
      {params?.error ? <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-error">{params.error}</p> : null}
      {params?.saved ? <p className="rounded-2xl bg-secondary-soft p-4 text-sm font-semibold text-secondary">Memory saved to {displayPetName}&apos;s timeline.</p> : null}
      <div className="flex flex-col gap-5">
        {realMemories.slice(0, 2).map((memory) => (
          <MemoryCard key={memory.id} memory={memory} />
        ))}
        {realPet && realMemories.length === 0 ? (
          <Card className="bg-surface-soft">
            <h2 className="font-display text-2xl font-semibold text-primary">No memories yet</h2>
            <p className="mt-2 leading-7 text-outline">Write one small note below. It can be as simple as a nap, a walk, or a funny little moment.</p>
          </Card>
        ) : null}
        {realPet ? (
          <div className="ml-auto w-11/12 rounded-2xl rounded-br-sm border border-secondary-soft bg-secondary-soft/40 p-5 text-secondary">
          <p className="flex items-start gap-2 leading-7">
            <Sparkles className="mt-1 shrink-0" size={18} />
            Tiny notes add up. Save what you notice now, and future-you will have the full story.
          </p>
          </div>
        ) : null}
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
          <input name="body" disabled={!realPet} className="min-w-0 flex-1 border-0 border-b border-outline/40 bg-transparent px-0 py-3 focus:border-primary focus:ring-0 disabled:opacity-50" placeholder={realPet ? "Share a moment..." : "Create a pet first"} />
          <button type="submit" disabled={!realPet} className="rounded-full bg-primary p-3 text-white disabled:opacity-50" aria-label="Send">
            <Send size={18} />
          </button>
        </div>
      </form>
    </AppShell>
  );
}
