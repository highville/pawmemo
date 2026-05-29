"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/app-data";

export async function deleteSavedReport(reportId: string) {
  const { supabase, user } = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in?next=/app/reports");
  }

  const { data, error } = await supabase
    .from("generated_reports")
    .delete()
    .eq("id", reportId)
    .eq("owner_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    redirect(`/app/reports?message=${encodeURIComponent("That saved report could not be found or was already removed.")}`);
  }

  redirect(`/app/reports?message=${encodeURIComponent("Saved report deleted. Your original memories were not changed.")}`);
}
