import { ArrowRight, Camera, Cat, Dog, Heart, Smartphone } from "lucide-react";
import Link from "next/link";
import { Card, PageHeader } from "@/components/ui";
import { createPet } from "@/app/onboarding/actions";
import { getCurrentUser, getFirstPet } from "@/lib/app-data";

type OnboardingPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const { user } = await getCurrentUser();
  const existingPet = user ? await getFirstPet(user.id) : null;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-8 bg-background px-6 py-10">
      <div className="h-1 overflow-hidden rounded-full bg-surface-line">
        <div className="h-full w-1/3 rounded-full bg-coral" />
      </div>
      <PageHeader
        title="Welcome to PawMemo"
        body="Start with one pet profile so every note, photo, and recap stays connected to the right companion."
      />
      <Card className="space-y-3">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <Smartphone size={18} />
          Your first step
        </div>
        <p className="text-sm leading-6 text-outline">Create a simple pet profile now. You can start saving memories right after.</p>
      </Card>
      {params?.error ? <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-error">{params.error}</p> : null}
      {existingPet ? (
        <Card className="space-y-4 bg-primary-soft/70">
          <h2 className="font-display text-2xl font-semibold text-primary">{existingPet.name} is already set up</h2>
          <p className="leading-7 text-outline">Your journal is ready. Keep adding quick notes and photos from Home whenever something small feels worth remembering.</p>
          <Link href="/app" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90">
            Go to journal <ArrowRight size={18} />
          </Link>
        </Card>
      ) : (
      <form action={createPet} className="flex flex-1 flex-col gap-7">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-outline">Pet Name</span>
          <input name="name" className="w-full border-0 border-b border-outline/40 bg-transparent px-0 py-3 text-lg text-primary focus:border-primary focus:ring-0" defaultValue="Momo" />
        </label>
        <div className="space-y-3">
          <span className="text-sm font-semibold text-outline">Pet Type</span>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Dog", icon: Dog },
              { label: "Cat", icon: Cat },
              { label: "Other", icon: Heart }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <label key={item.label} className="flex cursor-pointer items-center gap-2 rounded-full border border-transparent bg-surface-muted px-5 py-3 text-sm font-semibold text-outline transition has-[:checked]:border-secondary has-[:checked]:bg-secondary-soft has-[:checked]:text-secondary">
                  <input name="species" type="radio" value={item.label} defaultChecked={index === 1} className="sr-only" />
                  <Icon size={17} />
                  {item.label}
                </label>
              );
            })}
          </div>
        </div>
        <div className="flex aspect-square max-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-outline/30 bg-surface-soft px-6 text-center">
          <Camera className="mb-4 text-outline" size={42} />
          <p className="font-semibold text-primary">Profile photo coming later</p>
          <p className="mt-2 text-sm leading-6 text-outline">For now, add photos to individual memories after creating your pet.</p>
        </div>
        <button className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90">
          Create pet profile <ArrowRight size={18} />
        </button>
      </form>
      )}
    </main>
  );
}
