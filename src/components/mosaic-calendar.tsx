import Image from "next/image";
import { mosaicDays } from "@/lib/mock-data";

const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

export function MosaicCalendar() {
  return (
    <section className="rounded-2xl border border-surface-line bg-surface-soft/70 p-3 shadow-ambient backdrop-blur md:p-6">
      <div className="mb-4 grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-[0.18em] text-outline">
        {weekdays.map((day, index) => (
          <div key={`${day}-${index}`}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 md:gap-4">
        <div />
        {mosaicDays.map((day) => (
          <div
            key={day.day}
            className="relative aspect-square overflow-hidden rounded-xl border border-transparent bg-surface text-sm font-semibold text-outline shadow-sm"
          >
            {day.image ? (
              <Image src={day.image} alt={`Memory from October ${day.day}`} fill className="object-cover" sizes="120px" />
            ) : (
              <span className="flex h-full items-center justify-center">{day.day}</span>
            )}
            {day.signal ? <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-coral shadow" /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
