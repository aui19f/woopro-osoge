"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Spinner from "@/components/ui/components/Spinner/Spinner";

type ReceptionStatus = "WAITING" | "READY" | "IN_PROGRESS" | "DONE" | "CANCELLED";

type ReceptionItem = {
  id: string;
  phone: string | null;
  name: string | null;
  date: string;
  time: string;
  status: ReceptionStatus;
  agreed: boolean;
  message_sent_count: number;
  quantity: number;
  payment_amount: number | null;
  memo: string | null;
  images: string[];
  deadline: string | null;
  storeId: string | null;
};

const STATUS_LABEL: Record<ReceptionStatus, string> = {
  WAITING: "대기",
  READY: "준비",
  IN_PROGRESS: "진행",
  DONE: "완료",
  CANCELLED: "취소",
};

const STATUS_STYLE: Record<ReceptionStatus, string> = {
  WAITING: "bg-purple-50 text-purple-600",
  READY: "bg-blue-50 text-blue-600",
  IN_PROGRESS: "bg-yellow-50 text-yellow-700",
  DONE: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-600",
};

const DATE_FILTERS = [
  { value: "day",    label: "하루"   },
  { value: "week",   label: "일주일" },
  { value: "custom", label: "월지정" },
  { value: "all",    label: "전체"   },
] as const;

type DateFilterValue = (typeof DATE_FILTERS)[number]["value"];

const STATUSES: { value: ReceptionStatus; label: string; active: string }[] = [
  { value: "WAITING",     label: "대기", active: "bg-purple-100 text-purple-600 border-purple-300" },
  { value: "READY",       label: "준비", active: "bg-blue-100 text-blue-600 border-blue-300" },
  { value: "IN_PROGRESS", label: "진행", active: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { value: "DONE",        label: "완료", active: "bg-green-100 text-green-700 border-green-300" },
  { value: "CANCELLED",   label: "취소", active: "bg-red-100 text-red-600 border-red-300" },
];

function maskPhone(phone: string) {
  return phone.replace(
    /(\d{3})-(\d{3,4})-(\d{4})/,
    (_, p1, p2, p3) => `${p1}-${"*".repeat(p2.length)}-${p3}`
  );
}

function Highlight({ text, search }: { text: string; search: string }) {
  if (!search.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(search.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <strong className="font-bold text-point">{text.slice(idx, idx + search.length)}</strong>
      {text.slice(idx + search.length)}
    </>
  );
}

function formatDate(yyyymmdd: string) {
  if (yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}.${yyyymmdd.slice(4, 6)}.${yyyymmdd.slice(6)}`;
}

// YYYY-MM-DD → 표시용 "YYYY.MM.DD"
function formatISODate(iso: string) {
  if (!iso) return "";
  return iso.replace(/-/g, ".");
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function currentYYYYMM() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const SERVICE_START_MONTH = "2026-05";

// ── 날짜 피커 (하루 / 일주일 공통) ─────────────────────────────────────
function DatePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
      <span className="text-sm text-slate-500 shrink-0">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        max={todayISO()}
        className="text-sm border border-slate-200 rounded-lg h-9 px-2 focus:outline-none focus:border-blue-400"
      />
    </div>
  );
}

// ── 월 셀렉트 ────────────────────────────────────────────────────────────
function MonthPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (month: string) => void;
}) {
  const options = useMemo(() => {
    const list: { value: string; label: string }[] = [];
    const today = new Date();
    const [sy, sm] = SERVICE_START_MONTH.split("-").map(Number) as [number, number];
    const start = new Date(sy, sm - 1, 1);
    const cur = new Date(today.getFullYear(), today.getMonth(), 1);
    while (cur >= start) {
      const val = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`;
      list.push({ value: val, label: `${cur.getFullYear()}년 ${cur.getMonth() + 1}월` });
      cur.setMonth(cur.getMonth() - 1);
    }
    return list;
  }, []);

  return (
    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
      <span className="text-sm text-slate-500">월 선택</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm border border-slate-200 rounded-lg h-9 px-2 focus:outline-none focus:border-blue-400"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────

export default function ReceptionView({
  receptions,
  dateFilter,
  fromDay,
  toWeek,
  fromMonth,
  statusParam,
  sortField,
  sortDir,
  postpaidOnly,
}: {
  receptions: ReceptionItem[];
  dateFilter: string;
  fromDay: string;
  toWeek: string;
  fromMonth: string;
  statusParam: string;
  sortField: "date" | "created";
  sortDir: "asc" | "desc";
  postpaidOnly: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [memoSearch, setMemoSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // 모달이 열리면(pathname 변경) 스피너 해제
  useEffect(() => { setLoadingId(null); }, [pathname]);

  // 로컬 필터 상태 — 조회 버튼 전까지 URL에 반영하지 않음
  const normDate = (dateFilter === "today" ? "day" : dateFilter) as DateFilterValue;
  const [localDateFilter, setLocalDateFilter] = useState<DateFilterValue>(normDate);
  const [localDay,    setLocalDay]    = useState(fromDay   || todayISO());
  const [localWeekEnd, setLocalWeekEnd] = useState(toWeek  || todayISO());
  const [localMonth,  setLocalMonth]  = useState(fromMonth || currentYYYYMM());
  const [localStatuses, setLocalStatuses] = useState<Set<ReceptionStatus>>(
    () => new Set(statusParam.split(",").filter(Boolean) as ReceptionStatus[])
  );
  const [localSortField, setLocalSortField] = useState<"date" | "created">(sortField);
  const [localSortDir,   setLocalSortDir]   = useState<"asc" | "desc">(sortDir);
  const [localPostpaidOnly, setLocalPostpaidOnly] = useState(postpaidOnly);

  function applyFilters() {
    const url = new URL(window.location.href);
    url.searchParams.set("date", localDateFilter);

    // 날짜 파라미터 정리 후 현재 모드에 맞게 설정
    url.searchParams.delete("from");
    url.searchParams.delete("to");

    if (localDateFilter === "day") {
      url.searchParams.set("from", localDay);
    } else if (localDateFilter === "week") {
      url.searchParams.set("to", localWeekEnd);
    } else if (localDateFilter === "custom" && localMonth) {
      url.searchParams.set("from", localMonth);
    }

    const statusStr = Array.from(localStatuses).join(",");
    if (statusStr) url.searchParams.set("status", statusStr);
    else url.searchParams.delete("status");

    url.searchParams.set("sort",  localSortField);
    url.searchParams.set("order", localSortDir);

    if (localPostpaidOnly) url.searchParams.set("postpaid", "1");
    else url.searchParams.delete("postpaid");

    router.push(url.pathname + url.search);
  }

  function handleDateFilter(value: DateFilterValue) {
    setLocalDateFilter(value);
    if (value === "custom" && !localMonth) setLocalMonth(currentYYYYMM());
  }

  function toggleStatus(value: ReceptionStatus) {
    setLocalStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  // 검색: 클라이언트 사이드
  const filtered = useMemo(() => {
    let list = receptions;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          (r.phone ?? "").replace(/-/g, "").includes(q.replace(/-/g, "")) ||
          (r.name ?? "").toLowerCase().includes(q)
      );
    }
    if (memoSearch.trim()) {
      const q = memoSearch.toLowerCase();
      list = list.filter((r) => (r.memo ?? "").toLowerCase().includes(q));
    }
    return list;
  }, [receptions, search, memoSearch]);

  // 필터 요약 텍스트
  const dateLabel = (() => {
    if (localDateFilter === "day")    return `${formatISODate(localDay)}`;
    if (localDateFilter === "week")   return `~${formatISODate(localWeekEnd)} 7일`;
    if (localDateFilter === "custom") return localMonth.replace("-", "년 ") + "월";
    return DATE_FILTERS.find((f) => f.value === localDateFilter)?.label ?? "";
  })();
  const statusLabels = Array.from(localStatuses).map((s) => STATUS_LABEL[s]).join(", ");
  const filterSummary = [dateLabel, statusLabels].filter(Boolean).join(" · ");
  const totalAmount = filtered.reduce((sum, r) => {
    const amount = r.payment_amount ?? 0;
    return sum + (r.status === "CANCELLED" ? -amount : amount);
  }, 0);

  return (
    <div>
      {/* 검색 바 */}
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${
            showFilters
              ? "bg-point text-white border-point"
              : "bg-white border-slate-200 text-slate-500"
          }`}
          aria-label="필터"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
        </button>

        <input
          type="text"
          placeholder="접수번호 또는 전화번호"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 h-10 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400"
        />

        <button
          onClick={applyFilters}
          className="h-10 px-5 rounded-lg bg-point text-white text-sm font-semibold shrink-0 active:opacity-80"
        >
          조회
        </button>
      </div>

      {/* 필터 요약 + 통계 */}
      <p className="mt-1.5 ml-12 text-xs text-slate-400">
        {filterSummary && `${filterSummary} | `}
        접수{filtered.length} / 총금액{totalAmount.toLocaleString()}원
      </p>

      {/* 필터 패널 */}
      {showFilters && (
        <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3">
          {/* 날짜 필터 버튼 */}
          <div className="flex gap-2 flex-wrap">
            {DATE_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleDateFilter(value)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  localDateFilter === value
                    ? "bg-point text-white"
                    : "bg-white border border-slate-200 text-slate-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 하루: 날짜 지정 */}
          {localDateFilter === "day" && (
            <DatePicker
              label="날짜"
              value={localDay}
              onChange={setLocalDay}
            />
          )}

          {/* 일주일: 기준 날짜 지정 (해당일 포함 7일 전까지) */}
          {localDateFilter === "week" && (
            <DatePicker
              label="기준 날짜"
              value={localWeekEnd}
              onChange={setLocalWeekEnd}
            />
          )}

          {/* 월지정 */}
          {localDateFilter === "custom" && (
            <MonthPicker value={localMonth} onChange={setLocalMonth} />
          )}

          {/* 정렬 */}
          <div className="flex gap-2 items-center flex-wrap">
            <select
              value={localSortField}
              onChange={(e) => setLocalSortField(e.target.value as "date" | "created")}
              className="text-sm border border-slate-200 rounded-lg h-9 px-2 focus:outline-none focus:border-blue-400"
            >
              <option value="created">입력날짜</option>
              <option value="date">접수날짜</option>
            </select>
            {(["desc", "asc"] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => setLocalSortDir(dir)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  localSortDir === dir
                    ? "bg-slate-700 text-white"
                    : "bg-white border border-slate-200 text-slate-600"
                }`}
              >
                {dir === "desc" ? "최신순" : "오래된순"}
              </button>
            ))}
          </div>

          {/* 상태 필터 */}
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map(({ value, label, active }) => {
              const isActive = localStatuses.has(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleStatus(value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    isActive ? active : "border-slate-200 text-slate-500"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* 후불 미정 필터 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLocalPostpaidOnly((v) => !v)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                localPostpaidOnly
                  ? "bg-orange-100 text-orange-700 border-orange-300"
                  : "border-slate-200 text-slate-500"
              }`}
            >
              후불 · 가격 미정
            </button>
            {localPostpaidOnly && (
              <span className="text-xs text-slate-400">후불이고 금액이 아직 입력 안된 건만 조회</span>
            )}
          </div>

          {/* 메모 검색 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 shrink-0">메모</span>
            <input
              type="text"
              placeholder="메모 내용 검색"
              value={memoSearch}
              onChange={(e) => setMemoSearch(e.target.value)}
              className="flex-1 h-9 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
            />
            {memoSearch && (
              <button
                type="button"
                onClick={() => setMemoSearch("")}
                className="text-xs text-slate-400 hover:text-slate-600 shrink-0"
              >
                지우기
              </button>
            )}
          </div>
        </div>
      )}

      {/* 카드 목록 */}
      <div className="mt-4 flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            접수 내역이 없습니다.
          </div>
        ) : (
          filtered.map((r) => {
            const displayContact = r.phone
              ? (search.trim() ? r.phone : maskPhone(r.phone))
              : (r.name ?? "-");
            const qty = r.quantity || 1;
            const isLoading = loadingId === r.id;
            return (
              <button
                key={r.id}
                onClick={() => { setLoadingId(r.id); router.push(`/master/list/${r.id}`); }}
                disabled={!!loadingId}
                className="w-full text-left flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 hover:border-slate-300 hover:shadow-sm transition-all active:scale-[0.99] disabled:opacity-70"
              >
                <div
                  className={`w-1 self-stretch rounded-full shrink-0 ${
                    r.status === "WAITING"       ? "bg-purple-400"
                    : r.status === "READY"       ? "bg-blue-400"
                    : r.status === "IN_PROGRESS" ? "bg-yellow-400"
                    : r.status === "DONE"        ? "bg-green-400"
                    : "bg-red-300"
                  }`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm text-slate-500">
                      <Highlight text={r.id} search={search} />
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {r.deadline && (
                        <span className="text-[13px] leading-none">⭐</span>
                      )}
                      {r.images.length > 0 && (
                        <span className="flex items-center gap-0.5 text-slate-400">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          {r.images.length > 1 && <span className="text-[10px] leading-none">{r.images.length}</span>}
                        </span>
                      )}
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[r.status]}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    </div>
                  </div>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    <Highlight text={displayContact} search={search} />
                  </p>
                  {r.memo && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {r.memo}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5">
                    {formatDate(r.date)}&nbsp;{r.time.slice(0, 5)}
                    &nbsp;·&nbsp;{qty}건
                    {r.payment_amount != null && <>&nbsp;·&nbsp;{r.payment_amount.toLocaleString()}원</>}
                  </p>
                </div>

                {isLoading
                  ? <Spinner size={16} className="text-slate-400 shrink-0" />
                  : <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                }
              </button>
            );
          })
        )}
      </div>

      <p className="mt-3 text-xs text-slate-400 text-right">
        총 {filtered.length}건
        {receptions.length !== filtered.length && ` (전체 ${receptions.length}건)`}
      </p>
    </div>
  );
}
