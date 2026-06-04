import Link from "next/link";
import { ChevronRight, ClipboardList, Mail } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader } from "@/components/ui";
import { getCurrentUser, getRecentGeneratedReports } from "@/lib/app-data";
import { reports } from "@/lib/mock-data";

type ReportsPageProps = {
  searchParams?: Promise<{
    message?: string;
  }>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const { user } = await getCurrentUser();
  const recentReports = user ? await getRecentGeneratedReports(user.id, 4) : [];

  return (
    <AppShell active="reports">
      <PageHeader title="Reports" body="Turn saved memories into gentle letters and neutral note summaries when you need them." />
      {params?.message ? <p className="rounded-2xl bg-secondary-soft p-4 text-sm font-semibold leading-6 text-secondary">{params.message}</p> : null}
      <div className="grid gap-4">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Link
              key={report.href}
              href={report.href}
              className="flex items-center gap-4 rounded-2xl border border-surface-line bg-surface p-6 text-left shadow-ambient transition hover:bg-surface-soft"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary">
                <Icon size={24} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-2xl font-semibold text-primary">{report.title}</span>
                <span className="mt-1 block leading-6 text-outline">{report.description}</span>
              </span>
              <ChevronRight className="text-outline" />
            </Link>
          );
        })}
      </div>

      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-semibold text-primary">Recent saved reports</h2>
          <p className="leading-7 text-outline">Generated letters and summaries you can revisit later.</p>
        </div>
        {recentReports.length > 0 ? (
          <div className="grid gap-3">
            {recentReports.map((report) => {
              const Icon = report.reportType === "weekly_paw_letter" ? Mail : ClipboardList;
              const sourceLabel = formatSourceCounts(report.sourceMemoryCount, report.sourceCareSignalCount);

              return (
                <Link
                  key={report.id}
                  href={`/app/reports/saved/${report.id}`}
                  className="flex items-start gap-4 rounded-2xl border border-surface-line bg-surface p-5 text-left shadow-ambient transition hover:bg-surface-soft"
                >
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${report.reportType === "weekly_paw_letter" ? "bg-primary-soft text-primary" : "bg-secondary-soft text-secondary"}`}>
                    <Icon size={21} />
                  </span>
                  <span className="min-w-0 flex-1 space-y-2">
                    <span className="inline-flex rounded-full bg-surface-muted px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-outline">{report.type}</span>
                    <span className="block font-display text-xl font-semibold leading-tight text-primary">{report.title}</span>
                    <span className="block text-sm font-semibold leading-6 text-outline">
                      {report.period} - saved {report.createdAt}
                    </span>
                    {sourceLabel ? <span className="block text-xs font-semibold text-outline">{sourceLabel}</span> : null}
                  </span>
                  <ChevronRight className="mt-3 shrink-0 text-outline" />
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="space-y-2 bg-primary-soft/60">
            <h3 className="font-display text-2xl font-semibold text-primary">No saved reports yet</h3>
            <p className="leading-7 text-outline">Generate a Weekly Paw Letter or Vet-ready Summary, and it will appear here for later reading.</p>
          </Card>
        )}
      </section>
    </AppShell>
  );
}

function formatSourceCounts(memoryCount: number | null, careSignalCount: number | null) {
  const parts = [];

  if (memoryCount !== null) {
    parts.push(`${memoryCount} ${memoryCount === 1 ? "memory" : "memories"}`);
  }

  if (careSignalCount !== null && careSignalCount > 0) {
    parts.push(`${careSignalCount} care ${careSignalCount === 1 ? "signal" : "signals"}`);
  }

  return parts.join(" - ");
}
