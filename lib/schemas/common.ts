import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "이메일을 입력해주세요.")
  .email("올바른 이메일 형식이 아닙니다.");

export const passwordSchema = z
  .string()
  .min(6, "비밀번호는 최소 6자리 이상이어야 합니다.");

export const phoneSchema = z
  .string()
  .regex(/^010\d{8}$/, "올바른 핸드폰 번호 형식이 아닙니다. (01012345678)");
