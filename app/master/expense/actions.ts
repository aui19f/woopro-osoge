"use server";

import { EnumExpenseMethod } from "@/generated/prisma";
import {
  createExpense,
  createExpenseCategory,
  createExpenseSubcategory,
  deleteExpenseCategory,
  deleteExpenseSubcategory,
  updateExpenseCategory,
  updateExpenseSubcategory,
} from "@/services/expense";

export type ExpenseState = { status: number; message: string } | null;

const VALID_METHODS = new Set(["CARD", "CASH", "PAY", "OTHER"]);

export async function registerExpense(
  _prev: ExpenseState,
  formData: FormData
): Promise<ExpenseState> {
  const rawDate        = formData.get("date")          as string;
  const rawAmount      = formData.get("amount")        as string;
  const rawMethod      = formData.get("method")        as string;
  const memo           = (formData.get("memo")         as string) || undefined;
  const subcategoryId  = (formData.get("subcategoryId") as string) || undefined;

  if (!/^\d{8}$/.test(rawDate))
    return { status: 400, message: "날짜를 선택해주세요." };

  const amount = parseInt(rawAmount.replace(/,/g, ""));
  if (!amount || amount <= 0)
    return { status: 400, message: "금액을 입력해주세요." };

  if (!VALID_METHODS.has(rawMethod))
    return { status: 400, message: "결제 방법을 선택해주세요." };

  try {
    await createExpense({ date: rawDate, amount, method: rawMethod as EnumExpenseMethod, memo, subcategoryId });
    return { status: 200, message: "성공" };
  } catch (e) {
    console.error(e);
    return { status: 500, message: "저장 실패" };
  }
}

// ---- 카테고리 관리 ----

export type CategoryActionState = { status: number; message: string } | null;

export async function addCategory(_prev: CategoryActionState, formData: FormData): Promise<CategoryActionState> {
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { status: 400, message: "이름을 입력해주세요." };
  try {
    await createExpenseCategory(name);
    return { status: 200, message: "추가되었습니다." };
  } catch (e) { console.error(e); return { status: 500, message: "저장 실패" }; }
}

export async function editCategory(_prev: CategoryActionState, formData: FormData): Promise<CategoryActionState> {
  const id   = formData.get("id")   as string;
  const name = (formData.get("name") as string)?.trim();
  if (!id || !name) return { status: 400, message: "이름을 입력해주세요." };
  try {
    await updateExpenseCategory(id, name);
    return { status: 200, message: "수정되었습니다." };
  } catch (e) { console.error(e); return { status: 500, message: "저장 실패" }; }
}

export async function removeCategory(_prev: CategoryActionState, formData: FormData): Promise<CategoryActionState> {
  const id = formData.get("id") as string;
  if (!id) return { status: 400, message: "ID가 없습니다." };
  try {
    await deleteExpenseCategory(id);
    return { status: 200, message: "삭제되었습니다." };
  } catch (e) { console.error(e); return { status: 500, message: "삭제 실패" }; }
}

export async function addSubcategory(_prev: CategoryActionState, formData: FormData): Promise<CategoryActionState> {
  const categoryId  = formData.get("categoryId")  as string;
  const name        = (formData.get("name")        as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || undefined;
  if (!categoryId || !name) return { status: 400, message: "이름을 입력해주세요." };
  try {
    await createExpenseSubcategory(categoryId, name, description);
    return { status: 200, message: "추가되었습니다." };
  } catch (e) { console.error(e); return { status: 500, message: "저장 실패" }; }
}

export async function editSubcategory(_prev: CategoryActionState, formData: FormData): Promise<CategoryActionState> {
  const id          = formData.get("id")           as string;
  const name        = (formData.get("name")        as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || undefined;
  if (!id || !name) return { status: 400, message: "이름을 입력해주세요." };
  try {
    await updateExpenseSubcategory(id, { name, description });
    return { status: 200, message: "수정되었습니다." };
  } catch (e) { console.error(e); return { status: 500, message: "저장 실패" }; }
}

export async function removeSubcategory(_prev: CategoryActionState, formData: FormData): Promise<CategoryActionState> {
  const id = formData.get("id") as string;
  if (!id) return { status: 400, message: "ID가 없습니다." };
  try {
    await deleteExpenseSubcategory(id);
    return { status: 200, message: "삭제되었습니다." };
  } catch (e) { console.error(e); return { status: 500, message: "삭제 실패" }; }
}
