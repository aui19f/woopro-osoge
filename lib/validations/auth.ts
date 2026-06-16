import { z } from "zod";
import { emailSchema, passwordSchema } from "@/lib/schemas/index";

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
