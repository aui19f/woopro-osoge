"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { extractStoragePath } from "@/lib/storage";

const BUCKET = "reception-images";

async function deleteFromStorage(urls: string[]) {
  if (!urls.length) return;
  const supabase = createSupabaseAdminClient();
  const paths = urls.map(extractStoragePath);
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) console.error("Storage delete error:", error);
}

export async function deleteReceptionImage(receptionId: string, imageUrl: string): Promise<void> {
  await deleteFromStorage([imageUrl]);
  const reception = await prisma.reception.findUnique({ where: { id: receptionId }, select: { images: true } });
  const next = (reception?.images ?? []).filter((u) => u !== imageUrl);
  await prisma.reception.update({ where: { id: receptionId }, data: { images: next } });
}

export async function deleteAllReceptionImages(receptionId: string): Promise<void> {
  const reception = await prisma.reception.findUnique({ where: { id: receptionId }, select: { images: true } });
  await deleteFromStorage(reception?.images ?? []);
  await prisma.reception.update({ where: { id: receptionId }, data: { images: [] } });
}
