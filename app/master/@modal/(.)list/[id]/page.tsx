import { notFound } from "next/navigation";
import { findReceptionById } from "@/services/reception";
import ReceptionDetailModal from "./ReceptionDetailModal";

export default async function ReceptionDetailModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reception = await findReceptionById(id);
  if (!reception) notFound();
  return <ReceptionDetailModal reception={reception} />;
}
