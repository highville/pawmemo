import { Activity, Camera, ClipboardList } from "lucide-react";
import { generateVetReadySummary } from "@/app/app/reports/vet-summary/actions";
import { AppShell } from "@/components/app-shell";
import { VetSummaryGenerator } from "@/components/vet-summary-generator";
import { ButtonLink, Card, PageHeader } from "@/components/ui";
import { getCurrentUser, getFirstPet, getUserMemories } from "@/lib/app-data";

export default async function VetSummaryPage() {
  const { supabase, user } = await getCurrentUser();
  const pet = user ? await getFirstPet(user.id) : null;
  const memories = user ? await getUserMemories(user.id) : [];
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentMemories = memories.filter((memory) => new Date(memory.occurred_at).getTime() >= since.getTime());
  const photoMemoryCount = recentMemories.filter((memory) => memory.signedImageUrl || memory.image_url).length;
  const { data: careSignals } = user
    ? await supabase
        .from("care_signals")
        .select("id")
        .eq("owner_id", user.id)
        .gte("observed_at", since.toISOString())
    : { data: [] };
  const careSignalCount = careSignals?.length ?? 0;
  const canGenerate = Boolean(pet && (recentMemories.length > 0 || careSignalCount > 0));
  const dateRange = formatDateRange(since, new Date());

  return (
    <AppShell active="reports">
      <PageHeader
        eyebrow="Vet-ready Summary"
        title={pet ? `Notes for ${pet.name}'s vet` : "Vet-ready Summary"}
        body="Organize recent memories and care signals into a neutral summary you can show at a visit."
      />

      {!pet ? (
        <Card className="space-y-4 text-center">
          <h2 className="font-display text-2xl font-semibold text-primary">Create a pet profile first</h2>
          <p className="mx-auto max-w-xl leading-7 text-outline">
            PawMemo needs one pet profile before it can prepare notes for a vet visit.
          </p>
          <ButtonLink href="/onboarding" className="w-full sm:w-auto">
            Create pet profile
          </ButtonLink>
        </Card>
      ) : null}

      {pet && !canGenerate ? (
        <Card className="space-y-4 text-center">
          <h2 className="font-display text-2xl font-semibold text-primary">No recent notes to summarize yet</h2>
          <p className="mx-auto max-w-xl leading-7 text-outline">
            Add a few quick memories or care-related tags, then PawMemo can organize them into a neutral summary.
          </p>
          <ButtonLink href="/app" className="w-full sm:w-auto">
            Add a quick memory
          </ButtonLink>
        </Card>
      ) : null}

      {pet && canGenerate ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="space-y-2">
              <ClipboardList className="text-secondary" />
              <p className="text-3xl font-semibold text-primary">{recentMemories.length}</p>
              <p className="text-sm font-semibold text-outline">recent memories</p>
            </Card>
            <Card className="space-y-2">
              <Activity className="text-secondary" />
              <p className="text-3xl font-semibold text-primary">{careSignalCount}</p>
              <p className="text-sm font-semibold text-outline">care signals</p>
            </Card>
            <Card className="space-y-2">
              <Camera className="text-secondary" />
              <p className="text-3xl font-semibold text-primary">{photoMemoryCount}</p>
              <p className="text-sm font-semibold text-outline">photo records</p>
            </Card>
          </div>

          <Card className="space-y-4">
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-semibold text-primary">Prepare a neutral summary</h2>
              <p className="leading-7 text-outline">
                PawMemo will organize notes from {dateRange}. Photo records may be mentioned, but images are not analyzed.
              </p>
              <p className="rounded-2xl bg-secondary-soft/40 p-4 text-sm font-semibold leading-6 text-secondary">
                This summary organizes your notes and is not a medical diagnosis.
              </p>
            </div>
            <VetSummaryGenerator
              action={generateVetReadySummary}
              disabled={!canGenerate}
              dateRange={dateRange}
              memoryCount={recentMemories.length}
              careSignalCount={careSignalCount}
              photoMemoryCount={photoMemoryCount}
            />
          </Card>
        </>
      ) : null}
    </AppShell>
  );
}

function formatDateRange(start: Date, end: Date) {
  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric"
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}
