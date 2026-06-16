import { findReceptions } from "@/services/reception";
import WaitingClient from "./WaitingClient";

function getTodayKST(): string {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`;
}

export default async function WaitingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const date = /^\d{8}$/.test(params.date ?? "") ? params.date! : getTodayKST();

  const receptions = await findReceptions({
    fromDate: date,
    toDate: date,
    sortField: "created",
    sortDir: "asc",
  });

  // WAITING 먼저, 나머지는 created 순
  const STATUS_ORDER: Record<string, number> = { WAITING: 0, READY: 1, IN_PROGRESS: 2, DONE: 3, CANCELLED: 4 };
  const sorted = [...receptions].sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9));

  const items = sorted.map((r) => ({
    id: r.id,
    phone: r.phone,
    name: r.name,
    time: r.time,
    status: r.status,
    quantity: r.quantity,
  }));

  return <WaitingClient items={items} date={date} />;
}
