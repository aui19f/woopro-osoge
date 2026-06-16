"use client";

import { startTransition, useActionState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applySchema, type ApplyInput } from "@/lib/schemas/apply";
import { formatPhone, formatBizNumber } from "@/lib/schemas/formatters";
import Button from "@/components/ui/components/forms/button/Button";
import Input from "@/components/ui/components/forms/input/Input";
import Textarea from "@/components/ui/components/forms/Textarea/Textarea";
import { applyAction } from "./actions";

export default function ApplyForm() {
  const [state, formAction, isPending] = useActionState(applyAction, null);

  const {
    watch,
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ApplyInput>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      name: "",
      phone: "",
      bizNumber: "",
      bizName: "",
      memo: "",
    },
  });

  console.log("name 값:", watch("name"));
  console.log("name 값:", watch("phone"));

  const onSubmit = handleSubmit((data) => {
    const fd = new FormData();

    fd.append("name", data.name);
    fd.append("phone", data.phone);
    if (data.bizNumber) fd.append("bizNumber", data.bizNumber);
    if (data.bizName) fd.append("bizName", data.bizName);
    if (data.memo) fd.append("memo", data.memo);

    startTransition(() => formAction(fd));
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Input
          placeholder="이름 *"
          isError={!!errors.name}
          {...register("name")}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-error">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="전화번호 * (예: 010-1234-5678)"
              isError={!!errors.phone}
              onChange={(e) => field.onChange(formatPhone(e.target.value))}
            />
          )}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-error">{errors.phone.message}</p>
        )}
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Controller
            name="bizNumber"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="사업자번호 (예: 000-00-0000)"
                isError={!!errors.bizNumber}
                onChange={(e) =>
                  field.onChange(formatBizNumber(e.target.value))
                }
              />
            )}
          />
          {errors.bizNumber && (
            <p className="mt-1 text-sm text-error">
              {errors.bizNumber.message}
            </p>
          )}
        </div>
        <Button type="button" variant="dark-line" sizing="md">
          조회
        </Button>
      </div>

      <div>
        <Input placeholder="상호명" {...register("bizName")} />
      </div>

      <div>
        <Textarea placeholder="문의사항을 입력해주세요" {...register("memo")} />
      </div>

      {state && (
        <p
          className={`text-sm ${state.status === 200 ? "text-accent" : "text-error"}`}
        >
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "신청 중..." : "신청하기"}
      </Button>
    </form>
  );
}
