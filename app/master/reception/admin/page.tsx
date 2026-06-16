import { countTodayReceptions } from "@/services/reception";
import AdminReception from "./AdminReception";

function getTodayKST() {
  const now = new Date();
  const date = now
    .toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
    .replace(/\. /g, "")
    .replace(".", "");
  const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return { date, iso };
}

function yyyymmddToISO(yyyymmdd: string): string {
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const { date: todayDate, iso: todayISO } = getTodayKST();

  // ?date=YYYYMMDD 로 날짜 지정 가능
  const paramDate = params.date;
  const initialISO = /^\d{8}$/.test(paramDate ?? "") ? yyyymmddToISO(paramDate!) : todayISO;
  const countDate  = /^\d{8}$/.test(paramDate ?? "") ? paramDate! : todayDate;

  const todayCount = await countTodayReceptions(countDate);
  return <AdminReception todayCount={todayCount} todayISO={initialISO} />;
}
