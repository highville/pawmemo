import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader } from "@/components/ui";
import { getCurrentUser, getRecentGeneratedReports } from "@/lib/app-data";
import { reports } from "@/lib/mock-data";

export default async function ReportsPage() {
  const { user } = await getCurrentUser();
  const recentReports = user ? await getRecentGeneratedReports(user.id, 4) : [];

  return (
    <AppShell active="reports">
      <PageHeader title="Reports" body="Turn saved memories into gentle letters and neutral note summaries when you need them." />
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
            {recentReports.map((report) => (
              <Link
                key={report.id}
                href={`/app/reports/saved/${report.id}`}
                className="flex items-center gap-4 rounded-2xl border border-surface-line bg-surface p-5 text-left shadow-ambient transition hover:bg-surface-soft"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold uppercase tracking-[0.16em] text-outline">{report.type}</span>
                  <span className="mt-1 block truncate font-display text-xl font-semibold text-primary">{report.title}</span>
                  <span className="mt-1 block text-sm font-semibold text-outline">{report.period} · saved {report.createdAt}</span>
                </span>
                <ChevronRight className="shrink-0 text-outline" />
              </Link>
            ))}
          </div>
        ) : (
          <Card className="bg-surface-soft">
            <p className="leading-7 text-outline">No saved reports yet. Generate a Weekly Paw Letter or Vet-ready Summary, and it will appear here.</p>
          </Card>
        )}
      </section>
    </AppShell>
  );
}
