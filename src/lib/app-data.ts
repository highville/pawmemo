import { PawPrint } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type PetRow = Database["public"]["Tables"]["pets"]["Row"];
export type MemoryRow = Database["public"]["Tables"]["memories"]["Row"];

export type AppMemory = {
  id: string;
  title: string;
  body: string;
  time: string;
  tag: string;
  image: string | null;
  icon: typeof PawPrint;
};

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null };
  }

  await ensureProfile(user.id, user.email ?? null);
  return { supabase, user };
}

export async function ensureProfile(userId: string, email: string | null) {
  const supabase = await createSupabaseServerClient();
  const displayName = email?.split("@")[0] ?? "Pet parent";

  await supabase
    .from("profiles")
    .upsert({ id: userId, display_name: displayName }, { onConflict: "id" });
}

export async function getFirstPet(ownerId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("pets")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function getUserMemories(ownerId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("memories")
    .select("*")
    .eq("owner_id", ownerId)
    .order("occurred_at", { ascending: false });

  return data ?? [];
}

export function toAppMemory(memory: MemoryRow): AppMemory {
  return {
    id: memory.id,
    title: memory.title,
    body: memory.body,
    time: formatMemoryTime(memory.occurred_at),
    tag: memory.mood ?? "Memory",
    image: memory.image_url,
    icon: PawPrint
  };
}

function formatMemoryTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}
