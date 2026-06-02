import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseBrowserConfig } from "@/lib/supabase/config";

export async function GET() {
  redirect("/auth/sign-in");
}

export async function POST() {
  if (hasSupabaseBrowserConfig()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect("/auth/sign-in");
}
