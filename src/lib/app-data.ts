import { PawPrint } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type PetRow = Database["public"]["Tables"]["pets"]["Row"];
export type MemoryRow = Database["public"]["Tables"]["memories"]["Row"];
export type MemoryAssetRow = Database["public"]["Tables"]["memory_assets"]["Row"];
type MemoryWithImage = MemoryRow & {
  signedImageUrl?: string | null;
  savedTag?: string | null;
};

export type AppMemory = {
  id: string;
  title: string;
  body: string;
  time: string;
  tag: string | null;
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

  const memories = data ?? [];

  if (memories.length === 0) {
    return [];
  }

  const { data: assets, error } = await supabase
    .from("memory_assets")
    .select("*")
    .eq("owner_id", ownerId)
    .in(
      "memory_id",
      memories.map((memory) => memory.id)
    )
    .order("created_at", { ascending: true });

  const { data: memoryTags } = await supabase
    .from("memory_tags")
    .select("memory_id, tag_id")
    .eq("owner_id", ownerId)
    .in(
      "memory_id",
      memories.map((memory) => memory.id)
    );

  const tagIds = Array.from(new Set((memoryTags ?? []).map((tag) => tag.tag_id)));
  const { data: tags } = tagIds.length
    ? await supabase.from("tags").select("id, name").eq("owner_id", ownerId).in("id", tagIds)
    : { data: [] };

  const tagNamesById = new Map((tags ?? []).map((tag) => [tag.id, tag.name]));
  const tagsByMemoryId = new Map<string, string>();

  for (const memoryTag of memoryTags ?? []) {
    if (!tagsByMemoryId.has(memoryTag.memory_id)) {
      const tagName = tagNamesById.get(memoryTag.tag_id);

      if (tagName) {
        tagsByMemoryId.set(memoryTag.memory_id, tagName);
      }
    }
  }

  const signedUrls = new Map<string, string>();
  if (!error && assets?.length) {
    await Promise.all(
      assets.map(async (asset) => {
        if (signedUrls.has(asset.memory_id)) {
          return;
        }

        const { data: signed } = await supabase.storage
          .from(asset.storage_bucket)
          .createSignedUrl(asset.storage_path, 60 * 60);

        if (signed?.signedUrl) {
          signedUrls.set(asset.memory_id, signed.signedUrl);
        }
      })
    );
  }

  return memories.map((memory) => ({
    ...memory,
    signedImageUrl: signedUrls.get(memory.id) ?? null,
    savedTag: tagsByMemoryId.get(memory.id) ?? null
  }));
}

export function toAppMemory(memory: MemoryWithImage): AppMemory {
  return {
    id: memory.id,
    title: memory.title,
    body: memory.body,
    time: formatMemoryTime(memory.occurred_at),
    tag: memory.savedTag ?? null,
    image: memory.signedImageUrl ?? memory.image_url,
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
