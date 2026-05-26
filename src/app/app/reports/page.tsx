import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/ui";
import { reports } from "@/lib/mock-data";

export default function ReportsPage() {
  return (
    <AppShell active="reports">
      <PageHeader title="Reports" body="View summaries and letters." />
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
    </AppShell>
  );
}
