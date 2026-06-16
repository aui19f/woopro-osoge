"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Spinner from "@/components/ui/components/Spinner/Spinner";

type DayData = { amount: number; count: number };

type Props = {
  month: string;
  receptionTotal: number;
  expenseTotal: number;
  receptionByDay: Record<string, DayData>;
  expenseByDay: Record<string, number>;
};

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

function getTodayKST(): string {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`;
}

function getCurrentMonthKST(): string {
  return getTodayKST().slice(0, 6);
}

function shiftMonth(yyyymm: string, delta: number): string {
  const y = parseInt(yyyymm.slice(0, 4));
  const m = parseInt(yyyymm.slice(4, 6)) - 1 + delta;
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function compact(n: number): string {
  if (n === 0) return "";
  if (n >= 10000) return `${Math.floor(n / 10000)}만`;
  if (n >= 1000) return `${Math.floor(n / 1000)}천`;
  return n.toLocaleString();
}

function formatDateLabel(yyyymmdd: string): string {
  return `${parseInt(yyyymmdd.slice(4, 6))}월 ${parseInt(yyyymmdd.slice(6, 8))}일`;
}

export default function DashboardClient({
  month,
  receptionTotal,
  expenseTotal,
  receptionByDay,
  expenseByDay,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null); // YYYYMMDD

  useEffect(() => { setIsNavigating(false); }, [pathname, month]);

  const navigate = (url: string) => {
    setSelectedDay(null);
    setIsNavigating(true);
    router.push(url);
  };

  const year = parseInt(month.slice(0, 4));
  const m = parseInt(month.slice(4, 6));
  const todayStr = getTodayKST();
  const currentMonth = getCurrentMonthKST();
  const isCurrentMonth = month === currentMonth;

  const lastDay = new Date(year, m, 0).getDate();
  const firstDow = new Date(year, m - 1, 1).getDay();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: lastDay }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <>
      <main className="p-4 pb-8 max-w-lg mx-auto">
        {/* 월 선택 */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate(`/master?month=${shiftMonth(month, -1)}`)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <h2 className="text-lg font-bold text-slate-800">{year}년 {m}월</h2>

          <button
            onClick={() => navigate(`/master?month=${shiftMonth(month, 1)}`)}
            disabled={isCurrentMonth}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* 요약 카드 */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 bg-white rounded-2xl px-4 py-4 border border-slate-100">
            <p className="text-xs text-slate-400 mb-1.5">접수 매출</p>
            <p className="text-xl font-bold text-emerald-600 tracking-tight">
              +{receptionTotal.toLocaleString()}
              <span className="text-sm font-medium ml-0.5">원</span>
            </p>
          </div>
          <div className="flex-1 bg-white rounded-2xl px-4 py-4 border border-slate-100">
            <p className="text-xs text-slate-400 mb-1.5">지출</p>
            <p className="text-xl font-bold text-rose-500 tracking-tight">
              -{expenseTotal.toLocaleString()}
              <span className="text-sm font-medium ml-0.5">원</span>
            </p>
          </div>
        </div>

        {/* 달력 */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {DOW.map((d, i) => (
              <div
                key={d}
                className={`text-center py-2 text-xs font-semibold ${
                  i === 0 ? "text-rose-400" : i === 6 ? "text-blue-400" : "text-slate-400"
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* 날짜 셀 */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-50">
            {cells.map((day, idx) => {
              if (day === null) {
                return <div key={`e-${idx}`} className="min-h-[60px]" />;
              }

              const dateStr = `${month}${String(day).padStart(2, "0")}`;
              const rec = receptionByDay[dateStr];
              const exp = expenseByDay[dateStr] ?? 0;
              const isToday = dateStr === todayStr;
              const dow = idx % 7;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDay(dateStr)}
                  className={`min-h-[60px] p-1.5 cursor-pointer active:bg-slate-100 transition-colors ${isToday ? "bg-point/5" : ""}`}
                >
                  <div className="flex justify-center mb-0.5">
                    <span
                      className={`text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday
                          ? "bg-point text-white font-bold"
                          : dow === 0
                          ? "text-rose-400"
                          : dow === 6
                          ? "text-blue-400"
                          : "text-slate-600"
                      }`}
                    >
                      {day}
                    </span>
                  </div>

                  {rec && rec.amount > 0 && (
                    <p className="text-[9px] text-emerald-600 font-semibold leading-tight text-center truncate">
                      +{compact(rec.amount)}
                    </p>
                  )}
                  {exp > 0 && (
                    <p className="text-[9px] text-rose-500 font-semibold leading-tight text-center truncate">
                      -{compact(exp)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* 날짜 선택 모달 */}
      {selectedDay && (
        <div
          className="fixed inset-0 bottom-16 z-40 flex items-end justify-center bg-black/40"
          onClick={() => setSelectedDay(null)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-5 pb-3 text-center">
              <p className="text-xs text-slate-400">{formatDateLabel(selectedDay)}</p>
              <p className="text-sm font-semibold text-slate-700 mt-0.5">이동할 항목을 선택해주세요</p>
            </div>

            <div className="flex flex-col gap-2.5 px-5 pb-3">
              <button
                onClick={() => {
                  const iso = `${selectedDay.slice(0, 4)}-${selectedDay.slice(4, 6)}-${selectedDay.slice(6, 8)}`;
                  navigate(`/master/list?date=day&from=${iso}`);
                }}
                className="w-full h-14 rounded-2xl bg-emerald-500 text-white font-bold text-base active:opacity-80 transition-opacity"
              >
                수익
              </button>
              <button
                onClick={() => navigate(`/master/expense/list?from=${selectedDay}&to=${selectedDay}`)}
                className="w-full h-14 rounded-2xl bg-rose-500 text-white font-bold text-base active:opacity-80 transition-opacity"
              >
                지출
              </button>
              <button
                onClick={() => navigate(`/master/reception/admin?date=${selectedDay}`)}
                className="w-full h-14 rounded-2xl bg-point text-white font-bold text-base active:opacity-80 transition-opacity"
              >
                접수
              </button>
              <button
                onClick={() => navigate(`/master/reception/waiting?date=${selectedDay}`)}
                className="w-full h-14 rounded-2xl bg-slate-700 text-white font-bold text-base active:opacity-80 transition-opacity"
              >
                접수대기
              </button>
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="w-full h-12 text-sm text-slate-400 border-t border-slate-100 active:bg-slate-50 transition-colors"
            >
              취소
            </button>
            <div className="pb-[env(safe-area-inset-bottom)]" />
          </div>
        </div>
      )}

      {/* 페이지 이동 중 오버레이 */}
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <Spinner size={32} className="text-point" />
        </div>
      )}
    </>
  );
}
