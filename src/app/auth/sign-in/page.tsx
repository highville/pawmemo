import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { signIn } from "@/app/auth/actions";
import { AuthCard } from "@/components/auth-card";
import { hasSupabaseBrowserConfig } from "@/lib/supabase/config";

type SignInPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const canUseAuth = hasSupabaseBrowserConfig();

  return (
    <AuthCard
      title="Welcome back"
      body="Sign in to return to your pet's private journal."
      footer={
        <>
          New to PawMemo?{" "}
          <Link href="/auth/sign-up" className="text-primary">
            Create an account
          </Link>
        </>
      }
    >
      {params?.message ? <p className="rounded-2xl bg-secondary-soft p-4 text-sm font-semibold text-secondary">{params.message}</p> : null}
      {params?.error ? <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-error">{params.error}</p> : null}
      <form action={signIn} className="space-y-5">
        <input type="hidden" name="next" value={params?.next ?? "/app"} />
        <label className="block">
          <span className="text-sm font-semibold text-outline">Email</span>
          <input name="email" type="email" required className="mt-1 w-full border-0 border-b border-outline/30 bg-transparent px-0 py-3 text-primary focus:border-primary focus:ring-0" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-outline">Password</span>
          <input name="password" type="password" required className="mt-1 w-full border-0 border-b border-outline/30 bg-transparent px-0 py-3 text-primary focus:border-primary focus:ring-0" />
        </label>
        <button
          disabled={!canUseAuth}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sign in <ArrowRight size={18} />
        </button>
      </form>
    </AuthCard>
  );
}
