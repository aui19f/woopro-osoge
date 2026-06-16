"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Spinner from "@/components/ui/components/Spinner/Spinner";

type ReceptionStatus = "WAITING" | "READY" | "IN_PROGRESS" | "DONE" | "CANCELLED";

type WaitingItem = {
  id: string;
  phone: string | null;
  name: string | null;
  time: string;
  status: ReceptionStatus;
  quantity: number;
};

const STATUS_LABEL: Record<ReceptionStatus, string> = {
  WAITING: "대기",
  READY: "준비",
  IN_PROGRESS: "진행",
  DONE: "완료",
  CANCELLED: "취소",
};

const STATUS_STYLE: Record<ReceptionStatus, string> = {
  WAITING: "bg-purple-100 text-purple-600",
  READY: "bg-blue-100 text-blue-600",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  DONE: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-400",
};

const STATUS_BAR: Record<ReceptionStatus, string> = {
  WAITING: "bg-purple-400",
  READY: "bg-blue-400",
  IN_PROGRESS: "bg-amber-400",
  DONE: "bg-green-400",
  CANCELLED: "bg-red-300",
};

const POLL_INTERVAL = 5000;

function maskPhone(phone: string) {
  return phone.replace(/(\d{3})-(\d{3,4})-(\d{4})/, (_, p1, p2, p3) => `${p1}-${"*".repeat(p2.length)}-${p3}`);
}

function formatDateLabel(yyyymmdd: string) {
  if (yyyymmdd.length !== 8) return yyyymmdd;
  return `${parseInt(yyyymmdd.slice(0, 4))}년 ${parseInt(yyyymmdd.slice(4, 6))}월 ${parseInt(yyyymmdd.slice(6, 8))}일`;
}

export default function WaitingClient({
  items,
  date,
}: {
  items: WaitingItem[];
  date: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
      setLastUpdated(new Date());
    });
  }, [router]);

  // 5초마다 자동 갱신
  useEffect(() => {
    intervalRef.current = setInterval(refresh, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  const waitingItems = items.filter((i) => i.status === "WAITING");
  const otherItems = items.filter((i) => i.status !== "WAITING");

  const timeStr = lastUpdated.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="p-4 pb-24 max-w-lg mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{formatDateLabel(date)}</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            대기 <span className="font-semibold text-purple-600">{waitingItems.length}</span>명
            &nbsp;· 전체 {items.length}건
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={refresh}
            disabled={isPending}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-50"
            aria-label="새로고침"
          >
            {isPending ? (
              <Spinner size={16} className="text-slate-400" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            )}
          </button>
          <span className="text-[10px] text-slate-400">{timeStr}</span>
        </div>
      </div>

      {/* 대기 중 섹션 */}
      {waitingItems.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-purple-500 mb-2 px-1">대기 중</p>
          <div className="flex flex-col gap-2">
            {waitingItems.map((item, idx) => (
              <WaitingCard
                key={item.id}
                item={item}
                rank={idx + 1}
                onClick={() => router.push(`/master/list/${item.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 기타 상태 섹션 */}
      {otherItems.length > 0 && (
        <div>
          {waitingItems.length > 0 && (
            <p className="text-xs font-semibold text-slate-400 mb-2 px-1">진행 / 완료 / 취소</p>
          )}
          <div className="flex flex-col gap-2">
            {otherItems.map((item) => (
              <WaitingCard
                key={item.id}
                item={item}
                onClick={() => router.push(`/master/list/${item.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-20 text-slate-400 text-sm">
          접수 내역이 없습니다.
        </div>
      )}
    </div>
  );
}

function WaitingCard({
  item,
  rank,
  onClick,
}: {
  item: WaitingItem;
  rank?: number;
  onClick: () => void;
}) {
  const contact = item.phone ? maskPhone(item.phone) : (item.name ?? "-");
  const isWaiting = item.status === "WAITING";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 border rounded-2xl px-4 py-3 transition-all active:scale-[0.99] ${
        isWaiting
          ? "bg-purple-50 border-purple-200 hover:border-purple-300"
          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className={`w-1 self-stretch rounded-full shrink-0 ${STATUS_BAR[item.status]}`} />

      {/* 순번 (대기만 표시) */}
      {rank != null ? (
        <div className="w-8 text-center shrink-0">
          <span className={`text-lg font-bold ${isWaiting ? "text-purple-600" : "text-slate-400"}`}>{rank}</span>
        </div>
      ) : (
        <div className="w-8 shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-slate-400">{item.id}</span>
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[item.status]}`}>
            {STATUS_LABEL[item.status]}
          </span>
        </div>
        <p className={`font-semibold mt-0.5 ${isWaiting ? "text-slate-900" : "text-slate-700"}`}>{contact}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {item.time.slice(0, 5)} · {item.quantity}건
        </p>
      </div>

      <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
