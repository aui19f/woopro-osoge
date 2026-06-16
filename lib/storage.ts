"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const BUCKET = "reception-images";

export async function uploadReceptionImage(blob: Blob, dateStr: string): Promise<{ url: string; path: string }> {
  const supabase = createSupabaseBrowserClient();
  const id = Math.random().toString(36).slice(2, 10);
  const path = `${dateStr}/${id}.webp`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: "image/webp",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export function extractStoragePath(url: string): string {
  const marker = `/${BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? url : url.slice(idx + marker.length);
}
