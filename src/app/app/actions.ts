"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureProfile, getFirstPet } from "@/lib/app-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createMemory(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?next=/app");
  }

  await ensureProfile(user.id, user.email ?? null);

  const pet = await getFirstPet(user.id);
  const body = String(formData.get("body") ?? "").trim();
  const tag = String(formData.get("tag") ?? "Memory").trim() || "Memory";

  if (!pet) {
    redirect("/app?error=Create a pet profile before saving memories.");
  }

  if (!body) {
    redirect("/app?error=Write a little note before saving.");
  }

  const { error } = await supabase.from("memories").insert({
    owner_id: user.id,
    pet_id: pet.id,
    title: makeMemoryTitle(body),
    body,
    mood: tag
  });

  if (error) {
    redirect("/app?error=We couldn't save that memory. Please try again.");
  }

  revalidatePath("/app");
  revalidatePath("/app/timeline");
  redirect("/app?saved=1");
}

function makeMemoryTitle(body: string) {
  const firstLine = body.split(/\r?\n/)[0]?.trim() ?? "New memory";

  if (firstLine.length <= 48) {
    return firstLine;
  }

  return `${firstLine.slice(0, 45)}...`;
}
