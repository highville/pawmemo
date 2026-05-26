"use server";

import { redirect } from "next/navigation";
import { ensureProfile, getFirstPet } from "@/lib/app-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createPet(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?next=/onboarding");
  }

  await ensureProfile(user.id, user.email ?? null);

  const existingPet = await getFirstPet(user.id);

  if (existingPet) {
    redirect("/app");
  }

  const name = String(formData.get("name") ?? "").trim();
  const species = String(formData.get("species") ?? "Other").trim();

  if (!name) {
    redirect("/onboarding?error=Add your pet's name to continue.");
  }

  const { error } = await supabase.from("pets").insert({
    owner_id: user.id,
    name,
    species
  });

  if (error) {
    redirect("/onboarding?error=We couldn't create that pet profile. Please try again.");
  }

  redirect("/app");
}
