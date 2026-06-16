"use server";

import { redirect } from "next/navigation";

import { signupSchema } from "@/schemas/auth";
import { createUser, findFreePlan } from "@/services/users";
import { EnumRole } from "@/generated/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type SignupState = {
  status: number;
  message: string;
} | null;

export async function tempSignUp(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  // 1. 유효성 검사

  const result = await signupSchema.safeParseAsync({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("password-checked"),
  });

  if (!result.success) {
    return {
      status: 400,
      message: result.error.errors[0]?.message ?? "입력값을 확인해주세요.",
    };
  }

  const { email, password } = result.data;

  try {
    const supabase = createSupabaseAdminClient();

    // 2. Auth 유저 생성 + app_metadata 동시 저장
    //    app_metadata는 서버만 수정 가능 → 미들웨어에서 DB 조회 없이 role 확인
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        app_metadata: { role: EnumRole.GUEST },
        email_confirm: true,
      });

    if (authError) {
      console.log("authError: ", authError);
      if (authError.status && authError.status >= 500) throw authError;
      return { status: 400, message: authError.message };
    }

    if (!authData.user) {
      console.log("유저 생성 실패");
      throw new Error("유저 생성 실패");
    }

    // 3. 프리 플랜 조회
    const freePlan = await findFreePlan();
    console.log("freePlan", freePlan);
    if (!freePlan) {
      console.log("프리 플랜이 존재하지 않습니다. seed를 먼저 실행해주세요.");
      throw new Error(
        "프리 플랜이 존재하지 않습니다. seed를 먼저 실행해주세요."
      );
    }

    // 4. DB users 테이블 저장
    await createUser({ id: authData.user.id, email, planId: freePlan.id });

    // 5. DB 저장 완료 후 app_metadata에 plan 추가
    await supabase.auth.admin.updateUserById(authData.user.id, {
      app_metadata: {
        role: EnumRole.GUEST,
        planId: freePlan.id,
        planName: freePlan.name,
      },
    });
  } catch (error) {
    console.error("tempSignUp error:", error);
    return {
      status: 500,
      message: "회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    };
  }

  redirect("/login");
}
