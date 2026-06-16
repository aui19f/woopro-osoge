import { notFound } from "next/navigation";
import { findReceptionById } from "@/services/reception";
import ReceptionDetailPage from "./ReceptionDetailPage";

export default async function ReceptionDetailServerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reception = await findReceptionById(id);
  if (!reception) notFound();
  return <ReceptionDetailPage reception={reception} />;
}
