import Image from "next/image";
import Link from "next/link";
import { Download, Edit3, Home, LogOut, PawPrint, Star, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader } from "@/components/ui";
import { getCurrentUser, getFirstPet } from "@/lib/app-data";

export default async function SettingsPage() {
  const { user } = await getCurrentUser();
  const currentPet = user ? await getFirstPet(user.id) : null;
  const petName = currentPet?.name ?? "No pet yet";
  const petAvatar = currentPet?.avatar_url ?? null;
  const email = user?.email ?? "Signed in user";

  return (
    <AppShell active="settings" petName={petName} petAvatar={petAvatar}>
      <PageHeader title="Settings" />
      <Card className="space-y-6">
        <h2 className="font-display text-2xl font-semibold text-primary">Pet Profile</h2>
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {petAvatar ? (
              <Image src={petAvatar} alt={petName} width={96} height={96} className="h-24 w-24 rounded-full object-cover" />
            ) : (
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-soft text-primary">
                <PawPrint size={34} />
              </span>
            )}
            <button disabled className="absolute bottom-0 right-0 rounded-full bg-primary/60 p-2 text-white" aria-label="Profile photo coming later">
              <Edit3 size={14} />
            </button>
          </div>
          <p className="text-sm font-semibold text-outline">Profile photo upload is coming later.</p>
        </div>
        <label className="block">
          <span className="text-sm font-semibold text-outline">Name</span>
          <input readOnly className="mt-1 w-full border-0 border-b border-outline/30 bg-transparent px-0 py-2 text-primary focus:border-primary focus:ring-0" value={petName} />
        </label>
        {!currentPet ? <p className="text-sm font-semibold text-outline">Create a pet profile from onboarding to connect settings to your journal.</p> : null}
      </Card>
      <Card className="space-y-5">
        <h2 className="font-display text-2xl font-semibold text-primary">Account</h2>
        <div className="flex items-center justify-between border-b border-surface-line pb-4">
          <span className="font-semibold text-primary">Plan</span>
          <Link href="/pricing" className="flex items-center gap-2 rounded-full bg-secondary-soft px-3 py-1 text-sm font-semibold text-secondary">
            <Star size={15} />
            Early access
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <span>
            <span className="block font-semibold text-primary">Email</span>
            <span className="text-outline">{email}</span>
          </span>
          <Edit3 className="text-outline" size={18} />
        </div>
      </Card>
      <Link href="/onboarding" className="flex items-center gap-4 rounded-2xl bg-tertiary p-6 text-white shadow-lift">
        <Home />
        <span>
          <span className="block font-display text-2xl font-semibold">Add to Home Screen</span>
          <span className="mt-1 block text-sm leading-6 text-white/75">Keep your memories just a tap away.</span>
        </span>
      </Link>
      <Card className="p-2">
        <button disabled className="flex w-full cursor-not-allowed items-center gap-4 rounded-xl p-4 text-left text-outline">
          <Download />
          Export all memories coming later
        </button>
        <div className="mx-4 h-px bg-surface-line" />
        <Link href="/auth/sign-out" className="flex w-full items-center gap-4 rounded-xl p-4 text-left text-primary hover:bg-surface-soft">
          <LogOut />
          Sign out
        </Link>
        <div className="mx-4 h-px bg-surface-line" />
        <button disabled className="flex w-full cursor-not-allowed items-center gap-4 rounded-xl p-4 text-left text-outline">
          <Trash2 />
          Account deletion coming later
        </button>
      </Card>
      <footer className="pb-8 text-center text-sm font-semibold text-outline">PawMemo v1.0</footer>
    </AppShell>
  );
}
