import Image from "next/image";
import { Clock } from "lucide-react";
import type { memories } from "@/lib/mock-data";
import { Card } from "@/components/ui";

type Memory = (typeof memories)[number];

export function MemoryCard({ memory }: { memory: Memory }) {
  const Icon = memory.icon;

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          <Icon size={14} />
          {memory.tag}
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-outline">
          <Clock size={14} />
          {memory.time}
        </div>
      </div>
      <div>
        <h2 className="font-display text-2xl font-semibold text-primary">{memory.title}</h2>
        <p className="mt-2 leading-7 text-ink">{memory.body}</p>
      </div>
      {memory.image ? (
        <div className="relative h-56 overflow-hidden rounded-xl">
          <Image src={memory.image} alt={memory.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 640px" />
        </div>
      ) : null}
    </Card>
  );
}
