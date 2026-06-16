"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatPhone } from "@/lib/schemas/formatters";
import { phoneRegex } from "@/lib/schemas/regex";
import { receptionSchema, type ReceptionInput } from "@/schemas/reception";
import Checkbox from "@/components/ui/components/forms/Checkbox/Checkbox";
import Spinner from "@/components/ui/components/Spinner/Spinner";
import Toast from "@/components/ui/components/Toast/Toast";
import { useToast } from "@/components/ui/hooks/useToast";
import { registerReception, type ReceptionState } from "./actions";

const INITIAL_DIGITS = "010";

const KEYPAD_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["clear", "0", "delete"],
] as const;

type Key = (typeof KEYPAD_ROWS)[number][number];

const AGREE_OPTION = [
  { id: "agreed", label: "입력하신 정보는 예약 관리 목적으로 저장됩니다." },
];

export default function ReceptionKiosk({ notice }: { notice?: string }) {
  const [digits, setDigits] = useState(INITIAL_DIGITS);
  const [today, setToday] = useState("");
  const [showModal, setShowModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast(2000);

  const [state, formAction, isPending] = useActionState<ReceptionState, FormData>(
    registerReception,
    null
  );

  const { control, handleSubmit, setValue, watch, reset } =
    useForm<ReceptionInput>({
      resolver: zodResolver(receptionSchema),
      defaultValues: { phone: "", agreed: false },
    });

  const agreedValue = watch("agreed") ?? false;
  const formatted = formatPhone(digits);
  const isValid = phoneRegex.test(formatted);

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      })
    );
  }, []);

  // 저장 성공 시 초기화 + 출력 (임시)
  useEffect(() => {
    if (state?.status === 200) {
      if (state.printData) {
        const { id, phone, dateLabel, timeLabel } = state.printData;
        const seqNum = id.slice(-3);
        alert(`[ 출력 ]\n\n접수번호: ${seqNum}\n날짜: ${dateLabel}\n시간: ${timeLabel}\n전화번호: ${phone}`);
      }
      setShowModal(false);
      setDigits(INITIAL_DIGITS);
      reset({ phone: "", agreed: false });
      toast.show("완료되었습니다");
    }
  }, [state, reset, toast.show]);

  const updateDigits = (next: string) => {
    setDigits(next);
    setValue("phone", formatPhone(next), { shouldValidate: true });
  };

  const handleKey = (key: Key) => {
    if (key === "clear") {
      updateDigits(INITIAL_DIGITS);
    } else if (key === "delete") {
      updateDigits(
        digits.length > INITIAL_DIGITS.length ? digits.slice(0, -1) : digits
      );
    } else if (digits.length < 11) {
      updateDigits(digits + key);
    }
  };

  const handleConfirm = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <>
      {/* 서버 액션용 hidden form */}
      <form ref={formRef} action={formAction} className="sr-only" aria-hidden>
        <input name="phone" value={formatted} onChange={() => {}} />
        <input
          name="agreed"
          value={agreedValue ? "true" : "false"}
          onChange={() => {}}
        />
      </form>

      <div className="h-screen overflow-hidden flex flex-col items-center bg-white select-none">
        {/* 날짜 */}
        <div className="pt-10 pb-2 text-center">
          <p className="text-lg text-slate-400">{today}</p>
        </div>

        {/* 전화번호 표시 */}
        <div className="flex-1 flex items-center justify-center min-h-0 w-full">
          <p className="text-5xl font-bold tracking-widest text-slate-800">
            {formatted || "010-0000-0000"}
          </p>
        </div>

        {/* 키패드 */}
        <div className="flex flex-col gap-3">
          {KEYPAD_ROWS.map((row, i) => (
            <div key={i} className="flex gap-3">
              {row.map((key) => {
                const isSpecial = key === "clear" || key === "delete";
                return (
                  <button
                    key={key}
                    onClick={() => handleKey(key)}
                    className={`
                      w-20 h-20 rounded-2xl font-semibold
                      shadow-sm active:scale-95 transition-transform duration-75
                      ${
                        isSpecial
                          ? "bg-slate-100 text-slate-500 text-sm"
                          : "bg-white border border-slate-200 text-slate-800 text-2xl"
                      }
                    `}
                  >
                    {key === "clear" ? "초기화" : key === "delete" ? "지우기" : key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* 체크박스 */}
        <div className="pt-5 pb-1">
          <Controller
            control={control}
            name="agreed"
            render={({ field }) => (
              <Checkbox
                options={AGREE_OPTION}
                selected={field.value ? ["agreed"] : []}
                onChange={() => field.onChange(!field.value)}
              />
            )}
          />
        </div>

        {/* 등록 버튼 */}
        <div className="py-6 w-full flex justify-center px-8">
          <button
            onClick={handleSubmit(() => setShowModal(true))}
            disabled={!isValid}
            className={`
              w-full max-w-xs h-16 rounded-2xl text-xl font-bold transition-all duration-150
              ${
                isValid
                  ? "bg-point text-white shadow-lg active:scale-95"
                  : "bg-slate-100 text-slate-300 cursor-not-allowed"
              }
            `}
          >
            등록하기
          </button>
        </div>

        {/* 공지사항 */}
        {notice && (
          <div className="pb-8 px-8 w-full max-w-xs">
            <p className="text-sm text-slate-500 text-center line-clamp-3 leading-relaxed">
              {notice}
            </p>
          </div>
        )}
      </div>

      {/* 확인 모달 */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => !isPending && setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-10 w-80 flex flex-col items-center gap-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-slate-500">이 번호로 등록하시겠습니까?</p>
            <p className="text-3xl font-bold text-slate-800 tracking-widest">
              {formatted}
            </p>

            {state?.status === 401 && (
              <p className="text-error text-sm">{state.message}</p>
            )}

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-500 font-semibold text-lg disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className="flex-1 h-14 rounded-2xl bg-point text-white font-semibold text-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Spinner size={18} />
                    저장 중...
                  </>
                ) : (
                  "확인"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}
