import { getExpenseCategories } from "@/services/expense";
import ExpenseForm from "./ExpenseForm";

export default async function ExpensePage() {
  const categories = await getExpenseCategories();
  return <ExpenseForm categories={categories} />;
}
