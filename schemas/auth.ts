import { emailSchema, passwordSchema, phoneSchema } from "@/lib/schemas/index";
import { z } from "zod";

// ✅ 로그인용 스키마
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// ✅ 회원가입용 스키마
export const signupSchema = loginSchema
  .extend({
    // phone: phoneSchema,
    // planId: z.string().min(1, "플랜을 선택해주세요."),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"], // 에러 메시지가 confirmPassword 필드에 표시됨
  });

// ✅ [Type] 데이터 구조 (any 방지 및 RHF 적용 용도)
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
