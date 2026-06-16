import { sumReceptionAmountByMonth, receptionSummaryByDay } from "@/services/reception";
import { sumExpenseAmountByMonth, expenseSummaryByDay } from "@/services/expense";
import DashboardClient from "./DashboardClient";

function getCurrentMonthKST(): string {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function MasterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const month = /^\d{6}$/.test(params.month ?? "") ? params.month! : getCurrentMonthKST();

  const [receptionTotal, expenseTotal, recByDay, expByDay] = await Promise.all([
    sumReceptionAmountByMonth(month),
    sumExpenseAmountByMonth(month),
    receptionSummaryByDay(month),
    expenseSummaryByDay(month),
  ]);

  return (
    <DashboardClient
      month={month}
      receptionTotal={receptionTotal}
      expenseTotal={expenseTotal}
      receptionByDay={recByDay}
      expenseByDay={expByDay}
    />
  );
}
