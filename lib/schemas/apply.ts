import { z } from "zod";
import { bizNumberRegex, phoneRegex } from "./regex";

export const applySchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  phone: z
    .string()
    .min(1, "전화번호를 입력해주세요.")
    .regex(phoneRegex, "전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)"),
  bizNumber: z
    .string()
    .regex(bizNumberRegex, "사업자번호 형식이 올바르지 않습니다. (예: 000-00-0000)")
    .or(z.literal(""))
    .optional(),
  bizName: z.string().optional(),
  memo: z.string().optional(),
});

export type ApplyInput = z.infer<typeof applySchema>;
