import Link from "next/link";
import { findExpenses } from "@/services/expense";

type ExpenseMethod = "CARD" | "CASH" | "PAY" | "OTHER";

const METHOD_LABEL: Record<ExpenseMethod, string> = {
  CARD:  "카드",
  CASH:  "현금",
  PAY:   "페이",
  OTHER: "그외",
};

const METHOD_STYLE: Record<ExpenseMethod, string> = {
  CARD:  "bg-blue-50 text-blue-600",
  CASH:  "bg-green-50 text-green-700",
  PAY:   "bg-purple-50 text-purple-600",
  OTHER: "bg-slate-100 text-slate-500",
};

function toYYYYMMDD(date: Date) {
  return date
    .toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
    .replace(/\. /g, "")
    .replace(".", "");
}

function formatDate(yyyymmdd: string) {
  if (yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}.${yyyymmdd.slice(4, 6)}.${yyyymmdd.slice(6)}`;
}

export default async function ExpenseListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;

  const today = new Date();
  const todayStr = toYYYYMMDD(today);

  // 기본: 오늘 / ?from=YYYYMMDD&to=YYYYMMDD
  const fromDate = params.from ?? todayStr;
  const toDate   = params.to   ?? todayStr;

  const expenses = await findExpenses({ fromDate, toDate });

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 bg-white border-b border-slate-100 sticky top-0 z-10">
        <Link
          href="/master/expense"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-point transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          등록
        </Link>
        <p className="font-bold text-slate-800 text-lg">지출 리스트</p>
        <div className="w-12" />
      </div>

      <div className="px-4 mt-5 flex flex-col gap-3">
        {/* 합계 */}
        <div className="bg-white rounded-2xl px-5 py-4 border border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-400">
            {fromDate === toDate ? formatDate(fromDate) : `${formatDate(fromDate)} ~ ${formatDate(toDate)}`}
            &nbsp;·&nbsp;{expenses.length}건
          </span>
          <span className="text-lg font-bold text-point">
            {total.toLocaleString()}원
          </span>
        </div>

        {/* 목록 */}
        {expenses.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            지출 내역이 없습니다.
          </div>
        ) : (
          expenses.map((e) => (
            <div
              key={e.id}
              className="bg-white rounded-2xl px-5 py-4 border border-slate-100 flex items-center gap-3"
            >
              <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ${METHOD_STYLE[e.method as ExpenseMethod]}`}>
                {METHOD_LABEL[e.method as ExpenseMethod]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800">
                  {e.amount.toLocaleString()}원
                </p>
                {e.memo && (
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{e.memo}</p>
                )}
              </div>
              <p className="text-xs text-slate-400 shrink-0">{formatDate(e.date)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
