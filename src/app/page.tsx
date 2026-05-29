import Image from "next/image";
import { ArrowRight, Camera, HeartPulse, Lock, NotebookPen, ScrollText } from "lucide-react";
import { ButtonLink, Card } from "@/components/ui";

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="font-display text-3xl font-semibold text-primary">PawMemo</span>
        <ButtonLink href="/auth/sign-up" className="px-5 py-2.5">
          Start
        </ButtonLink>
      </header>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-20 pt-10 md:grid-cols-2 md:pt-20">
        <div className="space-y-6">
          <h1 className="font-display text-5xl font-bold leading-tight text-primary md:text-6xl">
            A private memory journal for your pet&apos;s everyday story.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-outline">
            Save quick notes, private photo memories, and gentle care observations. When you want a recap, PawMemo can help turn your notes into weekly letters and vet-ready summaries.
          </p>
          <ButtonLink href="/auth/sign-up">
            Start your pet&apos;s journal <ArrowRight size={18} />
          </ButtonLink>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lift">
          <Image
            src="https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=1200&q=80"
            alt="Pet parent holding a calm dog"
            fill
            priority
            className="object-cover"
          />
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Quick notes", icon: NotebookPen, body: "Capture a tiny moment, care note, or funny little detail in seconds." },
          { title: "Photo memories", icon: Camera, body: "Attach one private photo to a memory and see it again in your timeline." },
          { title: "Weekly letters", icon: ScrollText, body: "Ask for a warm AI-assisted letter based on the notes you saved." },
          { title: "Vet-ready summaries", icon: HeartPulse, body: "Organize recent notes for a vet conversation without diagnosis or medical advice." }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <Icon className="mb-4 text-secondary" />
              <h2 className="font-display text-2xl font-semibold text-primary">{item.title}</h2>
              <p className="mt-2 leading-7 text-outline">{item.body}</p>
            </Card>
          );
        })}
      </section>
      <footer className="border-t border-surface-line bg-surface-soft px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-sm font-semibold text-outline">
          <span>PawMemo</span>
          <span className="flex items-center gap-2"><Lock size={16} /> Private by design</span>
        </div>
      </footer>
    </main>
  );
}
