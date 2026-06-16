"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validations/auth";

export default async function loginAction(prev: unknown, formData: FormData) {
  const inputData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  let userRole = "";
  try {
    const result = await loginSchema.safeParseAsync(inputData);
    if (!result.success) {
      return { status: 400, message: "이메일, 비밀번호를 확인해주세요." };
    }

    const { email, password } = result.data;
    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      // 5xx는 예상 못한 서버 오류 → throw
      if (authError.status && authError.status >= 500) throw authError;
      return { status: 401, message: "아이디 또는 비밀번호가 틀렸습니다." };
    }

    if (!authData.session || !authData.user) {
      throw new Error("세션 생성 실패");
    }

    userRole = authData.user.app_metadata?.role?.toUpperCase() ?? "";
  } catch (error) {
    console.error("loginAction error:", error);
    return { status: 500, message: "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." };
  }

  redirect(`/${userRole.toLowerCase()}`);
}
