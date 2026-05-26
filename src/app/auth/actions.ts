"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { hasSupabaseBrowserConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getSafeNext(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/app";
  }

  return value;
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = getSafeNext(formData.get("next"));

  if (!hasSupabaseBrowserConfig()) {
    redirect(`/auth/sign-in?error=${encodeURIComponent("Supabase environment variables are not configured.")}&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/auth/sign-in?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? "http://localhost:3000";

  if (!hasSupabaseBrowserConfig()) {
    redirect(`/auth/sign-up?error=${encodeURIComponent("Supabase environment variables are not configured.")}`);
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`
    }
  });

  if (error) {
    redirect(`/auth/sign-up?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/auth/sign-in?message=Account created. Please sign in to continue.");
}
