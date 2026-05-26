import Image from "next/image";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader } from "@/components/ui";
import { letterSections, pet } from "@/lib/mock-data";

export default function WeeklyLetterPage() {
  return (
    <AppShell active="reports">
      <PageHeader
        eyebrow="Photo of the Week"
        title={`A week of love with ${pet.name}`}
        body="October 12 - October 18"
      />
      <div className="relative h-[52vh] overflow-hidden rounded-2xl shadow-lift">
        <Image
          src="https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=1200&q=80"
          alt="Momo resting peacefully"
          fill
          className="object-cover"
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {letterSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="space-y-4">
              <div className="flex items-center gap-2 text-secondary">
                <Icon />
                <h2 className="font-display text-2xl font-semibold text-primary">{section.title}</h2>
              </div>
              <p className="text-lg italic leading-8 text-outline">&quot;{section.body}&quot;</p>
            </Card>
          );
        })}
      </div>
      <Card className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-2xl font-semibold text-primary">Looking Ahead</h2>
        <p className="mt-3 leading-7 text-outline">Given the extra activity over the weekend, a gentler approach to walks might be appreciated.</p>
      </Card>
    </AppShell>
  );
}
