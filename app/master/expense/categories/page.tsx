import { getExpenseCategories } from "@/services/expense";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage() {
  const categories = await getExpenseCategories();
  return <CategoriesClient initialCategories={categories} />;
}
