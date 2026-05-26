import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MosaicCalendar } from "@/components/mosaic-calendar";

export default function MosaicPage() {
  return (
    <AppShell active="mosaic">
      <section className="flex items-center justify-between">
        <button className="rounded-full p-3 text-primary hover:bg-surface-muted" aria-label="Previous month">
          <ChevronLeft />
        </button>
        <h1 className="font-display text-3xl font-semibold text-primary md:text-5xl">October 2023</h1>
        <button className="rounded-full p-3 text-primary hover:bg-surface-muted" aria-label="Next month">
          <ChevronRight />
        </button>
      </section>
      <MosaicCalendar />
      <p className="text-center font-display text-2xl italic text-outline">14 beautiful moments captured this month.</p>
    </AppShell>
  );
}
