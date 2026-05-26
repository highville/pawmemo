import Image from "next/image";
import Link from "next/link";
import { Download, Edit3, Home, LogOut, Star, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader } from "@/components/ui";
import { pet } from "@/lib/mock-data";

export default function SettingsPage() {
  return (
    <AppShell active="settings">
      <PageHeader title="Settings" />
      <Card className="space-y-6">
        <h2 className="font-display text-2xl font-semibold text-primary">Pet Profile</h2>
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Image src={pet.avatar} alt={pet.name} width={96} height={96} className="h-24 w-24 rounded-full object-cover" />
            <button className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-white" aria-label="Edit photo">
              <Edit3 size={14} />
            </button>
          </div>
        </div>
        <label className="block">
          <span className="text-sm font-semibold text-outline">Name</span>
          <input className="mt-1 w-full border-0 border-b border-outline/30 bg-transparent px-0 py-2 text-primary focus:border-primary focus:ring-0" defaultValue={pet.name} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-outline">Birthday</span>
          <input className="mt-1 w-full border-0 border-b border-outline/30 bg-transparent px-0 py-2 text-primary focus:border-primary focus:ring-0" type="date" defaultValue={pet.birthday} />
        </label>
      </Card>
      <Card className="space-y-5">
        <h2 className="font-display text-2xl font-semibold text-primary">Account</h2>
        <div className="flex items-center justify-between border-b border-surface-line pb-4">
          <span className="font-semibold text-primary">Subscription</span>
          <Link href="/pricing" className="flex items-center gap-2 rounded-full bg-secondary-soft px-3 py-1 text-sm font-semibold text-secondary">
            <Star size={15} />
            Plus
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <span>
            <span className="block font-semibold text-primary">Email</span>
            <span className="text-outline">{pet.email}</span>
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
        <button className="flex w-full items-center gap-4 rounded-xl p-4 text-left text-primary hover:bg-surface-soft">
          <Download />
          Export all memories
        </button>
        <div className="mx-4 h-px bg-surface-line" />
        <Link href="/auth/sign-out" className="flex w-full items-center gap-4 rounded-xl p-4 text-left text-primary hover:bg-surface-soft">
          <LogOut />
          Sign out
        </Link>
        <div className="mx-4 h-px bg-surface-line" />
        <button className="flex w-full items-center gap-4 rounded-xl p-4 text-left text-outline hover:bg-red-50 hover:text-error">
          <Trash2 />
          Delete account
        </button>
      </Card>
      <footer className="pb-8 text-center text-sm font-semibold text-outline">PawMemo v1.0</footer>
    </AppShell>
  );
}
