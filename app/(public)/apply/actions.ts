"use server";

import { applySchema } from "@/lib/schemas/apply";

export type ApplyState = {
  status: number;
  message: string;
} | null;

export async function applyAction(
  _prev: ApplyState,
  formData: FormData
): Promise<ApplyState> {
  const raw = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    bizNumber: formData.get("bizNumber") || undefined,
    bizName: formData.get("bizName") || undefined,
    memo: formData.get("memo") || undefined,
  };

  const result = await applySchema.safeParseAsync(raw);
  if (!result.success) {
    return { status: 400, message: "입력값을 확인해주세요." };
  }

  // TODO: DB에 ApplicationRequest 저장
  console.log("신청 데이터:", result.data);

  return { status: 200, message: "신청이 완료되었습니다. 검토 후 연락드리겠습니다." };
}
