import { CheckCircle2, Lock, X } from "lucide-react";
import { ButtonLink, Card, PageHeader } from "@/components/ui";

const plans = [
  {
    name: "Free",
    price: "$0",
    body: "Perfect for starting your digital journal journey.",
    features: ["Limited entries", "Basic tags"],
    missing: ["Photo memories", "Weekly letters", "Vet-ready summaries"],
    cta: "Included in early access"
  },
  {
    name: "Plus",
    price: "$4.99",
    body: "The complete sanctuary for your pet's life story.",
    features: ["Unlimited entries", "Photo memories", "Weekly letters", "Monthly mosaic", "Vet-ready summaries"],
    missing: [],
    cta: "Payments coming later"
  }
];

export default function PricingPage() {
  return (
    <main className="min-h-dvh bg-background px-6 py-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        <header className="flex items-center justify-between">
          <ButtonLink href="/" variant="ghost" className="h-10 w-10 px-0 py-0" aria-label="Close pricing">
            <X size={18} />
          </ButtonLink>
          <span className="font-display text-3xl font-semibold text-primary">PawMemo</span>
          <span className="h-10 w-10" />
        </header>
        <div className="mx-auto max-w-2xl text-center">
          <PageHeader
            title="Keep every moment forever"
            body="Choose a plan that fits the way you want to preserve your pet's precious memories."
          />
        </div>
        <section className="grid gap-6 md:grid-cols-2">
          {plans.map((plan, index) => (
            <Card key={plan.name} className={index === 1 ? "relative border-coral bg-surface-muted md:-translate-y-4" : "bg-surface-soft"}>
              {index === 1 ? <span className="absolute right-6 top-6 rounded-full bg-coral px-3 py-1 text-xs font-bold uppercase text-tertiary">Most Popular</span> : null}
              <h2 className="font-display text-3xl font-semibold text-primary">{plan.name}</h2>
              <p className="mt-4">
                <span className="font-display text-5xl font-bold text-primary">{plan.price}</span>
                {index === 1 ? <span className="text-outline"> /mo</span> : null}
              </p>
              <p className="mt-4 leading-7 text-outline">{plan.body}</p>
              <ul className="my-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-primary">
                    <CheckCircle2 className="text-secondary" size={20} />
                    {feature}
                  </li>
                ))}
                {plan.missing.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-outline opacity-60">
                    <X size={20} />
                    {feature}
                  </li>
                ))}
              </ul>
              <span className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold ${index === 1 ? "bg-secondary-soft text-secondary" : "border border-outline/40 text-primary"}`}>
                {plan.cta}
              </span>
            </Card>
          ))}
        </section>
        <p className="flex items-center justify-center gap-2 text-sm font-semibold text-outline">
          <Lock size={15} />
          Pricing is a preview. Payments are not available yet.
        </p>
      </div>
    </main>
  );
}
