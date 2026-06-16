"use client";

import { useEffect, useState, useTransition } from "react";
import { logoutAction } from "../actions";

const PowerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
    <line x1="12" y1="2" x2="12" y2="12" />
  </svg>
);

export default function KioskGuard({ children }: { children: React.ReactNode }) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    window.history.pushState(null, "", window.location.pathname);
    const block = () => window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", block);
    return () => window.removeEventListener("popstate", block);
  }, []);

  const handleLogout = () => {
    startTransition(() => logoutAction());
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* 전원 버튼 */}
      <div className="absolute top-4 right-4 z-50">
        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="종료"
          >
            <PowerIcon />
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-2">
            <span className="text-sm text-slate-600 whitespace-nowrap">
              종료하시겠습니까?
            </span>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="text-sm font-semibold text-error disabled:opacity-50"
            >
              {isPending ? "종료 중..." : "종료"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={isPending}
              className="text-sm text-slate-400 disabled:opacity-50"
            >
              취소
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
