import { Card, PageHeader } from "@/components/ui";

export default function TimelineLoading() {
  return (
    <>
      <PageHeader title="Opening the memory trail..." body="Gathering notes, tags, and photo moments." />
      <div className="relative space-y-6 before:absolute before:left-5 before:top-0 before:h-full before:w-px before:bg-surface-line md:before:left-1/2">
        {[0, 1, 2].map((item) => (
          <div key={item} className="relative pl-14 md:grid md:grid-cols-2 md:gap-12 md:pl-0">
            <div className="absolute left-0 top-6 z-10 h-10 w-10 rounded-full border-4 border-background bg-primary-soft md:left-1/2 md:-translate-x-1/2" />
            <Card className={`animate-pulse space-y-4 bg-surface-soft ${item % 2 === 0 ? "md:col-start-1" : "md:col-start-2"}`}>
              <div className="h-4 w-28 rounded-full bg-surface-line" />
              <div className="h-7 w-3/4 rounded-full bg-surface-line" />
              <div className="h-4 w-full rounded-full bg-surface-line" />
              <div className="h-4 w-2/3 rounded-full bg-surface-line" />
            </Card>
          </div>
        ))}
      </div>
    </>
  );
}
