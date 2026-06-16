"use client";

import { useRouter } from "next/navigation";
import ReceptionDetailView, { type ReceptionDetail } from "./ReceptionDetailView";

export default function ReceptionDetailPage({
  reception,
}: {
  reception: ReceptionDetail;
}) {
  const router = useRouter();

  return (
    <main className="px-4 pt-4 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100dvh-5rem)] overflow-hidden">
        <ReceptionDetailView
          reception={reception}
          onClose={() => router.push("/master/list")}
          onSaved={() => { router.refresh(); router.push("/master/list"); }}
          mode="page"
        />
      </div>
    </main>
  );
}
