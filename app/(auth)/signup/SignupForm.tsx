"use client";

import { tempSignUp } from "@/app/(auth)/signup/actions";
import Button from "@/components/ui/components/forms/button/Button";
import Input from "@/components/ui/components/forms/input/Input";
import { useActionState } from "react";

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState(tempSignUp, null);
  return (
    <form action={formAction} className="space-y-2">
      <Input name="email" placeholder="이메일" />
      <Input name="password" type="password" placeholder="비밀번호" />
      <Input
        name="password-checked"
        type="password"
        placeholder="비밀번호 확인"
      />

      <Button
        type="submit"
        variant="primary"
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "회원가입 중..." : "회원가입"}
      </Button>
    </form>
  );
}
