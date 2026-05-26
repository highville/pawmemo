import { ArrowRight, Camera, Cat, Dog, Heart, Smartphone } from "lucide-react";
import { ButtonLink, Card, PageHeader } from "@/components/ui";

export default function OnboardingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-8 bg-background px-6 py-10">
      <div className="h-1 overflow-hidden rounded-full bg-surface-line">
        <div className="h-full w-1/3 rounded-full bg-coral" />
      </div>
      <PageHeader
        title="Welcome to PawMemo"
        body="A gentle space to hold your cherished moments with Momo forever."
      />
      <Card className="space-y-3">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <Smartphone size={18} />
          Keep memories close
        </div>
        <p className="text-sm leading-6 text-outline">Add PawMemo to your home screen for the best experience.</p>
      </Card>
      <form className="flex flex-1 flex-col gap-7">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-outline">Pet Name</span>
          <input className="w-full border-0 border-b border-outline/40 bg-transparent px-0 py-3 text-lg text-primary focus:border-primary focus:ring-0" defaultValue="Momo" />
        </label>
        <div className="space-y-3">
          <span className="text-sm font-semibold text-outline">Pet Type</span>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Dog", icon: Dog },
              { label: "Cat", icon: Cat },
              { label: "Other", icon: Heart }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <button key={item.label} type="button" className={`flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold ${index === 1 ? "border-secondary bg-secondary-soft text-secondary" : "border-transparent bg-surface-muted text-outline"}`}>
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex aspect-square max-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-outline/40 bg-surface-soft text-center">
          <Camera className="mb-4 text-primary" size={42} />
          <p className="font-semibold text-primary">Upload a photo of Momo</p>
          <p className="mt-2 text-sm text-outline">Static placeholder for Phase 1</p>
        </div>
        <ButtonLink href="/app" className="mt-auto w-full">
          Create Momo&apos;s memory space <ArrowRight size={18} />
        </ButtonLink>
      </form>
    </main>
  );
}
