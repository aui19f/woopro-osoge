import { z } from "zod";
import { phoneRegex } from "@/lib/schemas/regex";

export const receptionSchema = z.object({
  phone: z.string().regex(phoneRegex, "올바른 전화번호를 입력해주세요."),
  agreed: z.boolean().optional(),
});

export type ReceptionInput = z.infer<typeof receptionSchema>;
