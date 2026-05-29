import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { signUp } from "@/app/auth/actions";
import { AuthCard } from "@/components/auth-card";
import { hasSupabaseBrowserConfig } from "@/lib/supabase/config";

type SignUpPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const canUseAuth = hasSupabaseBrowserConfig();

  return (
    <AuthCard
      title="Create your memory space"
      body="Create a private journal for quick notes, photo memories, and gentle weekly recaps."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="text-primary">
            Sign in
          </Link>
        </>
      }
    >
      {params?.error ? <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-error">{params.error}</p> : null}
      <form action={signUp} className="space-y-5">
        <label className="block">
          <span className="text-sm font-semibold text-outline">Email</span>
          <input name="email" type="email" required className="mt-1 w-full border-0 border-b border-outline/30 bg-transparent px-0 py-3 text-primary focus:border-primary focus:ring-0" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-outline">Password</span>
          <input name="password" type="password" required minLength={6} className="mt-1 w-full border-0 border-b border-outline/30 bg-transparent px-0 py-3 text-primary focus:border-primary focus:ring-0" />
        </label>
        <button
          disabled={!canUseAuth}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sign up <ArrowRight size={18} />
        </button>
      </form>
    </AuthCard>
  );
}
