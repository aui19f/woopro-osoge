"use client";

import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/components/forms/input/Input";
import Button from "@/components/ui/components/forms/button/Button";

import loginAction from "@/app/(auth)/login/actions";
import { LoginInput, loginSchema } from "@/lib/validations/auth";

export default function LoginForm() {
  const [state, actions, isPending] = useActionState(loginAction, null);

  const { register, handleSubmit, setFocus } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const onSubmit = (data: LoginInput) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    startTransition(() => {
      actions(formData);
    });
  };

  useEffect(() => {
    if (state && state.status !== 200) {
      setFocus("email");
    }
  }, [state, setFocus]);

  return (
    <form
      className="flex flex-col w-full gap-4 px-4 my-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Input
        {...register("email")}
        placeholder="이메일"
        autoCapitalize="none"
        inputMode="email"
      />
      <Input {...register("password")} type="password" placeholder="비밀번호" />
      <p className="text-sm text-red-400">{state?.message}</p>
      <Button type="submit" variant="primary" disabled={isPending}>
        {isPending ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  );
}
