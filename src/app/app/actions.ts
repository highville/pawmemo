"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureProfile, getFirstPet } from "@/lib/app-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MEMORY_PHOTOS_BUCKET = "memory-photos";
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const CARE_SIGNAL_TAGS: Record<string, string> = {
  "Ate less": "appetite",
  "Vet visit": "vet"
};

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
  const tag = normalizeTag(formData.get("tag"));
  const photo = formData.get("photo");
  const photoFile = photo instanceof File && photo.size > 0 ? photo : null;

  if (!pet) {
    redirect("/app?error=Create a pet profile before saving memories.");
  }

  if (!body && !photoFile) {
    redirect("/app?error=Write a little note or add a photo before saving.");
  }

  if (photoFile && !ALLOWED_PHOTO_TYPES.has(photoFile.type)) {
    redirect("/app?error=Please choose a JPG, PNG, or WebP photo.");
  }

  if (photoFile && photoFile.size > MAX_PHOTO_SIZE) {
    redirect("/app?error=Please choose a photo under 5 MB.");
  }

  const memoryBody = body || "Photo memory";

  const { data: memory, error } = await supabase
    .from("memories")
    .insert({
      owner_id: user.id,
      pet_id: pet.id,
      title: makeMemoryTitle(memoryBody),
      body: memoryBody,
      mood: tag
    })
    .select("id")
    .single();

  if (error || !memory) {
    redirect("/app?error=We couldn't save that memory. Please try again.");
  }

  if (tag) {
    const { data: tagRow, error: tagError } = await supabase
      .from("tags")
      .upsert(
        {
          owner_id: user.id,
          name: tag,
          category: "quick"
        },
        { onConflict: "owner_id,name,category" }
      )
      .select("id")
      .single();

    if (tagError || !tagRow) {
      redirect("/app?error=Memory saved, but the tag could not be attached. Please try again later.");
    }

    const { error: memoryTagError } = await supabase.from("memory_tags").insert({
      owner_id: user.id,
      memory_id: memory.id,
      tag_id: tagRow.id
    });

    if (memoryTagError) {
      redirect("/app?error=Memory saved, but the tag could not be attached. Please try again later.");
    }

    const careSignalType = CARE_SIGNAL_TAGS[tag];

    if (careSignalType) {
      const { error: careSignalError } = await supabase.from("care_signals").insert({
        owner_id: user.id,
        pet_id: pet.id,
        memory_id: memory.id,
        signal_type: careSignalType,
        note: `Manual tag: ${tag}. Note: ${memoryBody}`
      });

      if (careSignalError) {
        redirect("/app?error=Memory saved, but the care note could not be attached. Please try again later.");
      }
    }
  }

  if (photoFile) {
    const assetId = crypto.randomUUID();
    const extension = getPhotoExtension(photoFile);
    const storagePath = `${user.id}/${pet.id}/${memory.id}/${assetId}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(MEMORY_PHOTOS_BUCKET)
      .upload(storagePath, photoFile, {
        contentType: photoFile.type,
        upsert: false
      });

    if (uploadError) {
      revalidatePath("/app");
      revalidatePath("/app/timeline");
      redirect("/app?error=Memory saved, but the photo could not be uploaded. Please try another photo later.");
    }

    const { error: assetError } = await supabase.from("memory_assets").insert({
      id: assetId,
      owner_id: user.id,
      pet_id: pet.id,
      memory_id: memory.id,
      storage_bucket: MEMORY_PHOTOS_BUCKET,
      storage_path: storagePath,
      mime_type: photoFile.type,
      file_size: photoFile.size
    });

    if (assetError) {
      await supabase.storage.from(MEMORY_PHOTOS_BUCKET).remove([storagePath]);
      revalidatePath("/app");
      revalidatePath("/app/timeline");
      redirect("/app?error=Memory saved, but the photo could not be attached. Please try another photo later.");
    }
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

function normalizeTag(value: FormDataEntryValue | null) {
  const tag = String(value ?? "").trim();

  if (!tag) {
    return null;
  }

  return tag.slice(0, 48);
}

function getPhotoExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension && ["jpg", "jpeg", "png", "webp"].includes(extension)) {
    return extension === "jpeg" ? "jpg" : extension;
  }

  switch (file.type) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}
