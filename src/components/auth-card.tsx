import Link from "next/link";
import { Lock } from "lucide-react";
import { Card } from "@/components/ui";
import { hasSupabaseBrowserConfig } from "@/lib/supabase/config";

export function AuthCard({
  title,
  body,
  children,
  footer
}: {
  title: string;
  body: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="block text-center font-display text-4xl font-semibold text-primary">
          PawMemo
        </Link>
        <Card className="space-y-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary-soft text-secondary">
              <Lock size={20} />
            </div>
            <h1 className="font-display text-3xl font-semibold text-primary">{title}</h1>
            <p className="leading-7 text-outline">{body}</p>
          </div>
          {!hasSupabaseBrowserConfig() ? (
            <p className="rounded-2xl bg-primary-soft/70 p-4 text-sm font-semibold leading-6 text-primary">
              Supabase environment variables are not configured yet. Add them to .env.local before testing Auth.
            </p>
          ) : null}
          {children}
          <p className="text-center text-sm font-semibold text-outline">{footer}</p>
        </Card>
      </div>
    </main>
  );
}
