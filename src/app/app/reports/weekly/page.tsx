import { CalendarHeart, Camera, PenLine } from "lucide-react";
import { generateWeeklyPawLetter } from "@/app/app/reports/weekly/actions";
import { AppShell } from "@/components/app-shell";
import { WeeklyLetterGenerator } from "@/components/weekly-letter-generator";
import { ButtonLink, Card, PageHeader } from "@/components/ui";
import { getCurrentUser, getFirstPet, getUserMemories } from "@/lib/app-data";

export default async function WeeklyLetterPage() {
  const { user } = await getCurrentUser();
  const pet = user ? await getFirstPet(user.id) : null;
  const memories = user ? await getUserMemories(user.id) : [];
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentMemories = memories.filter((memory) => new Date(memory.occurred_at).getTime() >= since.getTime());
  const photoMemoryCount = recentMemories.filter((memory) => memory.signedImageUrl || memory.image_url).length;
  const taggedMemoryCount = recentMemories.filter((memory) => memory.savedTag).length;
  const canGenerate = Boolean(pet && recentMemories.length > 0);
  const dateRange = formatDateRange(since, new Date());

  return (
    <AppShell active="reports">
      <PageHeader
        eyebrow="Weekly Paw Letter"
        title={pet ? `A gentle week with ${pet.name}` : "A gentle weekly letter"}
        body="Turn the last 7 days of memories into a short, private letter."
      />

      {!pet ? (
        <Card className="space-y-4 text-center">
          <h2 className="font-display text-2xl font-semibold text-primary">Create a pet profile first</h2>
          <p className="mx-auto max-w-xl leading-7 text-outline">
            PawMemo needs one pet profile before it can gather memories into a weekly letter.
          </p>
          <ButtonLink href="/onboarding" className="w-full sm:w-auto">
            Create pet profile
          </ButtonLink>
        </Card>
      ) : null}

      {pet && recentMemories.length === 0 ? (
        <Card className="space-y-4 text-center">
          <h2 className="font-display text-2xl font-semibold text-primary">No memories from the last 7 days yet</h2>
          <p className="mx-auto max-w-xl leading-7 text-outline">
            Add a few quick notes this week, then PawMemo can turn them into a warm little letter.
          </p>
          <ButtonLink href="/app" className="w-full sm:w-auto">
            Add a quick memory
          </ButtonLink>
        </Card>
      ) : null}

      {pet && recentMemories.length > 0 ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="space-y-2">
              <CalendarHeart className="text-secondary" />
              <p className="text-3xl font-semibold text-primary">{recentMemories.length}</p>
              <p className="text-sm font-semibold text-outline">memories this week</p>
            </Card>
            <Card className="space-y-2">
              <PenLine className="text-secondary" />
              <p className="text-3xl font-semibold text-primary">{taggedMemoryCount}</p>
              <p className="text-sm font-semibold text-outline">tagged notes</p>
            </Card>
            <Card className="space-y-2">
              <Camera className="text-secondary" />
              <p className="text-3xl font-semibold text-primary">{photoMemoryCount}</p>
              <p className="text-sm font-semibold text-outline">photo memories</p>
            </Card>
          </div>

          <Card className="space-y-4">
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-semibold text-primary">Ready when you are</h2>
              <p className="leading-7 text-outline">
                PawMemo will use recent text notes and tags from {dateRange}. Photo memories may be mentioned, but images are not analyzed.
              </p>
            </div>
            <WeeklyLetterGenerator
              action={generateWeeklyPawLetter}
              disabled={!canGenerate}
              dateRange={dateRange}
              memoryCount={recentMemories.length}
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
