import { ChevronLeft, ChevronRight } from "lucide-react";
import { MosaicCalendar } from "@/components/mosaic-calendar";

export default function MosaicPage() {
  return (
    <>
      <section className="flex items-center justify-between">
        <button className="rounded-full p-3 text-primary hover:bg-surface-muted" aria-label="Previous month">
          <ChevronLeft />
        </button>
        <h1 className="font-display text-3xl font-semibold text-primary md:text-5xl">Mosaic preview</h1>
        <button className="rounded-full p-3 text-primary hover:bg-surface-muted" aria-label="Next month">
          <ChevronRight />
        </button>
      </section>
      <MosaicCalendar />
      <p className="text-center font-display text-2xl italic text-outline">A calendar-style memory view is coming later.</p>
    </>
  );
}
