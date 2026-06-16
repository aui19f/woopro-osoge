"use client";

import { useRouter } from "next/navigation";
import ReceptionDetailView, {
  type ReceptionDetail,
} from "@/app/master/list/[id]/ReceptionDetailView";

export default function ReceptionDetailModal({
  reception,
}: {
  reception: ReceptionDetail;
}) {
  const router = useRouter();

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-60"
      onClick={() => router.back()}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <ReceptionDetailView
          reception={reception}
          onClose={() => router.back()}
          onSaved={() => { router.refresh(); router.back(); }}
          mode="modal"
        />
      </div>
    </div>
  );
}
