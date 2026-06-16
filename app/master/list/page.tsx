import { findReceptions, type EnumReceptionStatus } from "@/services/reception";
import ReceptionView from "./ReceptionView";

function toYYYYMMDD(date: Date): string {
  return date
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, "")
    .replace(".", "");
}

function toISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function lastDayOfMonth(yyyymm: string): string {
  const parts = yyyymm.split("-").map(Number) as [number, number];
  const lastDay = new Date(parts[0], parts[1], 0).getDate();
  return `${yyyymm.replace("-", "")}${String(lastDay).padStart(2, "0")}`;
}

function getDateRange(
  filter: string,
  params: Record<string, string>
): { fromDate?: string; toDate?: string } {
  const today = new Date();
  const todayStr = toYYYYMMDD(today);
  const todayISO = toISO(today);

  switch (filter) {
    // 하루: 날짜 지정 (기본값 오늘)
    case "day": {
      const dayISO = params.from ?? todayISO;
      const dayStr = dayISO.replace(/-/g, "");
      return { fromDate: dayStr, toDate: dayStr };
    }
    // 일주일: 기준 날짜로부터 7일 전까지 (기본값 오늘)
    case "week": {
      const endISO = params.to ?? todayISO;
      const endStr = endISO.replace(/-/g, "");
      const from = new Date(endISO + "T00:00:00");
      from.setDate(from.getDate() - 7);
      return { fromDate: toYYYYMMDD(from), toDate: endStr };
    }
    case "custom": {
      const from = params.from;
      if (!from) return {};
      return {
        fromDate: from.replace("-", "") + "01",
        toDate: lastDayOfMonth(from),
      };
    }
    // backward compat
    case "today":
      return { fromDate: todayStr, toDate: todayStr };
    default:
      return {};
  }
}

const VALID_STATUSES = new Set(["WAITING", "READY", "IN_PROGRESS", "DONE", "CANCELLED"]);

export default async function ReceptionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;

  // "today" → "day" 정규화 (이전 URL 하위 호환)
  const rawDate = params.date ?? "day";
  const dateFilter = rawDate === "today" ? "day" : rawDate;

  const statusParam = params.status ?? "READY";

  const today = new Date();
  const todayISO = toISO(today);

  const fromDay   = dateFilter === "day"    ? (params.from ?? todayISO) : todayISO;
  const toWeek    = dateFilter === "week"   ? (params.to   ?? todayISO) : todayISO;
  const fromMonth = dateFilter === "custom" ? (params.from ?? "")       : "";

  const { fromDate, toDate } = getDateRange(dateFilter, params);

  const statusFilter = statusParam
    .split(",")
    .filter((s) => VALID_STATUSES.has(s)) as EnumReceptionStatus[];

  const sortField = params.sort === "date" ? "date" : "created";
  const sortDir   = params.order === "asc"  ? "asc"  : "desc";
  const postpaidOnly = params.postpaid === "1";

  const receptions = await findReceptions({
    fromDate,
    toDate,
    status: statusFilter.length ? statusFilter : undefined,
    sortField,
    sortDir,
    postpaidOnly,
  });

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">접수 목록</h1>
      <ReceptionView
        receptions={receptions}
        dateFilter={dateFilter}
        fromDay={fromDay}
        toWeek={toWeek}
        fromMonth={fromMonth}
        statusParam={statusParam}
        sortField={sortField}
        sortDir={sortDir}
        postpaidOnly={postpaidOnly}
      />
    </main>
  );
}
