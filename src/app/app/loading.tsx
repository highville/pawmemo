import { Card, PageHeader } from "@/components/ui";

export default function AppLoading() {
  return (
    <>
      <PageHeader title="Opening your journal..." body="Gathering your pet's latest notes." />
      <div className="grid gap-4">
        <Card className="animate-pulse space-y-4 bg-surface-soft">
          <div className="h-4 w-32 rounded-full bg-surface-line" />
          <div className="h-8 w-3/4 rounded-full bg-surface-line" />
          <div className="h-4 w-full rounded-full bg-surface-line" />
          <div className="h-4 w-2/3 rounded-full bg-surface-line" />
        </Card>
        <Card className="animate-pulse space-y-4 bg-surface-soft">
          <div className="h-4 w-24 rounded-full bg-surface-line" />
          <div className="h-8 w-2/3 rounded-full bg-surface-line" />
          <div className="h-4 w-5/6 rounded-full bg-surface-line" />
        </Card>
      </div>
    </>
  );
}
