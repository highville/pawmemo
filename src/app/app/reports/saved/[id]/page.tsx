import Link from "next/link";
import { ArrowLeft, Camera, ClipboardList, FileText, Mail } from "lucide-react";
import { deleteSavedReport } from "@/app/app/reports/saved/[id]/actions";
import { AppShell } from "@/components/app-shell";
import { CopyReportButton } from "@/components/copy-report-button";
import { DeleteReportButton } from "@/components/delete-report-button";
import { Card, PageHeader } from "@/components/ui";
import { getCurrentUser, getFirstPet, getGeneratedReport } from "@/lib/app-data";

type SavedReportPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SavedReportPage({ params }: SavedReportPageProps) {
  const { id } = await params;
  const { user } = await getCurrentUser();
  const pet = user ? await getFirstPet(user.id) : null;
  const report = user ? await getGeneratedReport(user.id, id) : null;
  const deleteAction = deleteSavedReport.bind(null, id);

  return (
    <AppShell active="reports" petName={pet?.name ?? "your pet"} petAvatar={pet?.avatar_url ?? null}>
      <Link href="/app/reports" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-outline transition hover:text-primary">
        <ArrowLeft size={16} />
        Back to reports
      </Link>

      {!report ? (
        <>
          <PageHeader title="Report not found" body="This saved report may have been removed, or it may belong to another account." />
          <Card className="bg-primary-soft/70">
            <p className="leading-7 text-outline">Your saved reports are private to your account.</p>
          </Card>
        </>
      ) : (
        <>
          <PageHeader eyebrow={report.type} title={report.title} body={`${report.period} - saved ${report.createdAt}`} />
          <Card className="space-y-4 bg-primary-soft/50">
            <div className="flex items-start gap-3 rounded-2xl bg-surface/80 p-4">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${report.reportType === "weekly_paw_letter" ? "bg-primary-soft text-primary" : "bg-secondary-soft text-secondary"}`}>
                {report.reportType === "weekly_paw_letter" ? <Mail size={21} /> : <ClipboardList size={21} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-outline">{report.type}</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-outline">{report.period} - saved {report.createdAt}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {report.sourceMemoryCount !== null ? (
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-outline">
                  {report.sourceMemoryCount} {report.sourceMemoryCount === 1 ? "memory" : "memories"}
                </span>
              ) : null}
              {report.sourceCareSignalCount !== null && report.sourceCareSignalCount > 0 ? (
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-outline">
                  {report.sourceCareSignalCount} care {report.sourceCareSignalCount === 1 ? "signal" : "signals"}
                </span>
              ) : null}
              {report.includedPhotoRecords ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary-soft px-3 py-1 text-xs font-semibold text-secondary">
                  <Camera size={13} />
                  Includes photo records
                </span>
              ) : null}
            </div>

            {report.reportType === "vet_ready_summary" ? (
              <p className="rounded-2xl bg-secondary-soft/40 p-4 text-sm font-semibold leading-6 text-secondary">
                This saved summary organizes your notes and is not a medical diagnosis.
              </p>
            ) : null}

            <div className="rounded-2xl bg-surface/85 p-5 shadow-ambient">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-outline">
                <FileText size={16} />
                Saved report
              </div>
              <p className="whitespace-pre-line text-base leading-8 text-primary">{report.content}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <CopyReportButton content={report.content} />
              <DeleteReportButton action={deleteAction} />
            </div>
          </Card>
        </>
      )}
    </AppShell>
  );
}
