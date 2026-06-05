import Link from "next/link";
import { ArrowLeft, Lock, PawPrint } from "lucide-react";
import { TryDemo } from "@/components/try-demo";

export default function TryPage() {
  return (
    <main className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3 font-display text-3xl font-semibold text-primary">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary shadow-ambient">
            <PawPrint size={19} />
          </span>
          PawMemo
        </Link>
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-surface-line bg-surface/70 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-surface-soft">
          <ArrowLeft size={16} />
          Home
        </Link>
      </header>

      <section className="mx-auto max-w-6xl space-y-8 px-6 pb-20 pt-8 md:pt-14">
        <div className="max-w-3xl space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-secondary-soft px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-secondary">
            <Lock size={14} />
            No account needed
          </p>
          <h1 className="font-display text-5xl font-bold leading-tight text-primary md:text-6xl">
            Try a tiny PawMemo memory before you sign up.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-outline">
            See how one small note can become a private memory and a gentle letter preview. Nothing here is saved.
          </p>
        </div>

        <TryDemo />
      </section>
    </main>
  );
}
