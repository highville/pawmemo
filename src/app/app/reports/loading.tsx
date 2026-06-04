import { Card, PageHeader } from "@/components/ui";

export default function ReportsLoading() {
  return (
    <>
      <PageHeader title="Opening your saved letters..." body="Gathering gentle reports and summaries." />
      <div className="grid gap-4">
        {[0, 1].map((item) => (
          <Card key={item} className="animate-pulse space-y-4 bg-surface-soft">
            <div className="h-12 w-12 rounded-full bg-primary-soft" />
            <div className="h-7 w-2/3 rounded-full bg-surface-line" />
            <div className="h-4 w-full rounded-full bg-surface-line" />
          </Card>
        ))}
      </div>
    </>
  );
}
