"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatPhone } from "@/lib/schemas/formatters";
import { phoneRegex } from "@/lib/schemas/regex";
import Spinner from "@/components/ui/components/Spinner/Spinner";
import Toast from "@/components/ui/components/Toast/Toast";
import { useToast } from "@/components/ui/hooks/useToast";
import {
  adminRegisterReception,
  checkDuplicatePhone,
  getCountByDate,
  type ReceptionState,
} from "../actions";
import ImageUploader, { type StagedImage } from "./ImageUploader";
import { uploadReceptionImage } from "@/lib/storage";

interface Props {
  todayCount: number;
  todayISO: string;
}

function isoToYYYYMMDD(iso: string) {
  return iso.replace(/-/g, "");
}

function isoToDisplay(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

export default function AdminReception({ todayCount, todayISO }: Props) {
  const router = useRouter();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const memoRef = useRef<HTMLTextAreaElement>(null);
  const toast = useToast(2000);

  const [phoneDigits, setPhoneDigits] = useState("");
  const [maskMiddle, setMaskMiddle] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("admin_mask_middle");
    return saved === null ? false : saved === "true";
  });
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [isPostpaid, setIsPostpaid] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [count, setCount] = useState(todayCount);
  const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [dupWarning, setDupWarning] = useState<{ id: string; time: string; name: string | null; phone: string | null }[] | null>(null);

  const [state, formAction, isPending] = useActionState<
    ReceptionState,
    FormData
  >(adminRegisterReception, null);
  const [, startTransition] = useTransition();

  const phoneFormatted = formatPhone(phoneDigits);
  const isPhoneEntered = phoneRegex.test(phoneFormatted);
  const phoneSaved = isPhoneEntered
    ? maskMiddle
      ? phoneFormatted.replace(/-\d{3,4}-/, "-****-")
      : phoneFormatted
    : "";
  const isValid = isPhoneEntered || name.trim().length > 0;
  const dateYYYYMMDD = isoToYYYYMMDD(selectedDate);
  const displayDate = isoToDisplay(selectedDate);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    setPhoneDigits(digits);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "").replace(/\D/g, "");
    const num = raw ? parseInt(raw) : "";
    setAmount(num === "" ? "" : num.toLocaleString("ko-KR"));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    setSelectedDate(e.target.value);
  };

  const handleSubmit = async () => {
    if (!isValid || isPending || isUploading) return;
    setIsUploading(true);
    try {
      const urls: string[] = [];
      for (const img of stagedImages) {
        const { url } = await uploadReceptionImage(img.blob, dateYYYYMMDD);
        urls.push(url);
      }

      const fd = new FormData();
      if (phoneSaved) fd.set("phone", phoneSaved);
      if (name.trim()) fd.set("name", name.trim());
      fd.set("date", dateYYYYMMDD);
      if (amount) fd.set("amount", amount);
      if (isPostpaid) fd.set("paymentTiming", "POSTPAID");
      else if (amount) fd.set("paymentTiming", "PREPAID");
      fd.set("quantity", quantity);
      if (deadline) fd.set("deadline", deadline);
      if (memo.trim()) fd.set("memo", memo.trim());
      urls.forEach((u) => fd.append("images", u));

      startTransition(() => formAction(fd));
    } catch (e) {
      console.error("이미지 업로드 실패", e);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    phoneInputRef.current?.focus();
  }, []);

  useEffect(() => {
    getCountByDate(dateYYYYMMDD).then(setCount);
  }, [dateYYYYMMDD]);

  // 전화번호가 완성되면 당일 중복 체크
  useEffect(() => {
    if (!isPhoneEntered) return;
    checkDuplicatePhone(phoneFormatted, dateYYYYMMDD).then((result) => {
      if (result.length > 0) setDupWarning(result);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneFormatted, dateYYYYMMDD]);

  useEffect(() => {
    if (state?.status === 200) {
      setCount((c) => c + 1);
      setPhoneDigits("");
      setName("");
      setQuantity("1");
      setAmount("");
      setMemo("");
      setIsPostpaid(false);
      setDeadline("");
      setStagedImages([]);
      toast.show("완료되었습니다");
      router.refresh();
      setTimeout(() => phoneInputRef.current?.focus(), 0);
    }
  }, [state, router, toast.show]);

  return (
    <>
      <div className="min-h-screen bg-slate-50 pb-10">
        {/* 헤더 */}
        <div className="flex items-center justify-between py-2 px-4 bg-white border-b border-slate-100 sticky top-0 z-10">
          <div>
            <p className="text-xs text-slate-400 font-medium">
              관리자 접수 모드
            </p>
            <div
              className="relative mt-0.5 cursor-pointer"
              onClick={() =>
                dateInputRef.current?.showPicker?.() ??
                dateInputRef.current?.click()
              }
            >
              <p className="font-semibold text-slate-700 flex items-center gap-1.5 pr-1">
                {displayDate}
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-400"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </p>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
                tabIndex={-1}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">접수</p>
            <p className="text-2xl font-bold text-point">
              {count}
              <span className="text-sm font-normal text-slate-400 ml-1">
                건
              </span>
            </p>
          </div>
        </div>

        {/* 폼 */}
        <div className="mx-2 mt-2 flex flex-col gap-2">
          {/* 전화번호 */}
          <div className="bg-white rounded-2xl px-4 py-2 border border-slate-100">
            <div className="mb-2 flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="고객 이름"
                className="flex-1 h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800 text-lg font-semibold focus:outline-none focus:border-blue-400"
              />
              <button
                type="button"
                onClick={() => setName("급수선")}
                className={`h-11 px-3 rounded-xl text-sm font-medium shrink-0 transition-colors touch-manipulation ${
                  name === "급수선"
                    ? "bg-point text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                급수선
              </button>
            </div>

            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={maskMiddle}
                  onChange={(e) => {
                    setMaskMiddle(e.target.checked);
                    localStorage.setItem(
                      "admin_mask_middle",
                      String(e.target.checked)
                    );
                  }}
                  className="w-3.5 h-3.5 accent-point"
                />
                <span className="text-xs text-slate-400">뒷자리만 저장</span>
              </label>
              {isPhoneEntered && (
                <p className="text-xs text-slate-400">
                  저장: <span className="font-mono">{phoneSaved}</span>
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <input
                ref={phoneInputRef}
                type="tel"
                inputMode="numeric"
                value={phoneDigits ? phoneFormatted : ""}
                onChange={handlePhoneChange}
                placeholder="010-0000-0000"
                className={`w-full h-11 rounded-xl border bg-slate-50 px-4 text-lg font-semibold tracking-widest focus:outline-none focus:border-blue-400 ${
                  isPhoneEntered
                    ? "border-slate-200 text-slate-800"
                    : "border-slate-200 text-slate-400"
                }`}
              />
            </div>

            {/* 접수 링크 전송 (좌) / 마감일 (우) — UI only */}
            <div className="flex items-center justify-between mt-1.5">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 accent-point"
                />
                <span className="text-xs text-slate-400">접수 링크 전송</span>
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">마감일</span>
                <input
                  type="date"
                  value={deadline ? `${deadline.slice(0, 4)}-${deadline.slice(4, 6)}-${deadline.slice(6)}` : ""}
                  onChange={(e) => setDeadline(e.target.value.replace(/-/g, ""))}
                  className="text-xs border border-slate-200 rounded-lg h-7 px-2 focus:outline-none focus:border-blue-400 text-slate-600 touch-manipulation"
                />
                {deadline && (
                  <button
                    type="button"
                    onClick={() => setDeadline("")}
                    className="text-slate-400 hover:text-slate-600 touch-manipulation text-sm leading-none"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 금액 + 후불 */}
          <div className="bg-white rounded-2xl px-4 py-2 border border-slate-100">
            <div className="flex items-center gap-3">
              <label className="w-14 text-sm font-medium text-slate-500 shrink-0">
                금액
              </label>
              <div className="flex-1 relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 pr-8 text-slate-800 font-semibold focus:outline-none focus:border-blue-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  원
                </span>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isPostpaid}
                  onChange={(e) => setIsPostpaid(e.target.checked)}
                  className="w-4 h-4 accent-point"
                />
                <span className="text-sm text-slate-500">후불</span>
              </label>
            </div>
          </div>

          {/* 수량 */}
          <div className="bg-white rounded-2xl px-4 py-2 border border-slate-100">
            <div className="flex items-center gap-2">
              <label className="w-10 text-sm font-medium text-slate-500 shrink-0">
                수량
              </label>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onBlur={(e) => {
                  if (!e.target.value) setQuantity("1");
                }}
                className="w-16 h-10 rounded-lg border border-slate-200 bg-slate-50 px-2 text-slate-800 font-semibold text-center focus:outline-none focus:border-blue-400"
              />
              <span className="text-sm text-slate-400">개</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setQuantity(String(n))}
                    className={`w-9 h-10 rounded-lg text-sm font-semibold transition-colors touch-manipulation ${
                      quantity === String(n)
                        ? "bg-point text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 메모 */}
          <div className="bg-white rounded-2xl px-4 py-2 border border-slate-100">
            <label className="text-xs text-slate-400 block mb-2">메모</label>
            <textarea
              ref={memoRef}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="특이사항, 요청사항 등"
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 text-sm resize-none focus:outline-none focus:border-blue-400 leading-relaxed"
            />
            <div className="flex flex-col gap-1.5 mt-2">
              {[
                [
                  "바지",
                  "청바지",
                  "슬렉스",
                  "치마",
                  "원피스",
                  "티셔츠",

                  "니트",
                  "남방",
                  "자켓",
                  "마이",
                  "코트",
                ],
                ["기장", "워싱", "총장", "허리", "힙", "통", "품", "어깨"],
                ["+", "-", "*", "cm", `"(인치)`, "1단", "단", "&"],
                ["봉탈", "누빔", "지퍼", "똑딱이", "후크", "단추", "교체"],
              ].map((row, i) => (
                <div key={i} className="flex gap-1.5 flex-wrap">
                  {row.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setMemo((prev) => (prev ? `${prev} ${tag}` : tag));
                        memoRef.current?.focus();
                      }}
                      className="px-2.5 h-8 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 active:bg-slate-300 transition-colors touch-manipulation"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* 이미지 */}
          <div className="bg-white rounded-2xl px-4 py-3 border border-slate-100">
            <label className="text-xs text-slate-400 block mb-1">사진</label>
            <ImageUploader images={stagedImages} onChange={setStagedImages} />
          </div>

          {/* 에러 */}
          {state && state.status !== 200 && (
            <p className="text-center text-sm text-error">{state.message}</p>
          )}

          {/* 등록 버튼 */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isPending || isUploading}
            className={`
              w-full h-14 rounded-2xl text-lg font-bold transition-all duration-150 flex items-center justify-center gap-2
              ${
                isValid && !isPending && !isUploading
                  ? "bg-point text-white shadow-lg active:scale-95"
                  : "bg-slate-100 text-slate-300 cursor-not-allowed"
              }
            `}
          >
            {isPending || isUploading ? (
              <>
                <Spinner size={20} />
                {isUploading ? "업로드 중..." : "저장 중..."}
              </>
            ) : (
              "등록하기"
            )}
          </button>
        </div>
      </div>

      {/* 중복 번호 경고 모달 */}
      {dupWarning && (
        <div className="fixed inset-0 z-300 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* 상단 경고 영역 */}
            <div className="px-6 pt-6 pb-4 text-center">
              <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <p className="text-[15px] font-bold text-slate-800">오늘 접수된 번호가 있습니다.</p>
              <div className="mt-1 space-y-0.5">
                {dupWarning.map((d) => {
                  const isMasked = d.phone?.includes("****");
                  return (
                    <p key={d.id} className="text-xs text-slate-400">
                      {d.id}
                      {isMasked && (
                        <span className="ml-1 text-amber-500">(뒷자리 일치)</span>
                      )}
                    </p>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => router.push(`/master/list/${dupWarning[0]!.id}`)}
                className="mt-1.5 text-xs text-blue-500 underline underline-offset-2 touch-manipulation"
              >
                자세히보기
              </button>
            </div>

            {/* 버튼 */}
            <div className="flex border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setDupWarning(null);
                  setPhoneDigits("");
                  setTimeout(() => phoneInputRef.current?.focus(), 0);
                }}
                className="flex-1 h-12 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors touch-manipulation border-r border-slate-100"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => setDupWarning(null)}
                className="flex-1 h-12 text-sm font-bold text-point hover:bg-point/5 transition-colors touch-manipulation"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast.message} visible={toast.visible} />

      {/* 접수 중 전체화면 오버레이 */}
      {(isPending || isUploading) && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white/85 backdrop-blur-md">
          {/* 아이콘 + 스피너 */}
          <div className="relative flex items-center justify-center mb-6">
            {/* 바깥 링 */}
            <div className="absolute w-28 h-28 rounded-full border-4 border-point/20 animate-ping" />
            <div className="absolute w-28 h-28 rounded-full border-4 border-point/10" />
            {/* 회전 스피너 링 */}
            <svg className="absolute w-28 h-28 animate-spin" viewBox="0 0 112 112" fill="none">
              <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="4" strokeOpacity="0.15" className="text-point" />
              <path d="M56 6a50 50 0 0 1 50 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-point" />
            </svg>
            {/* 중앙 아이콘 */}
            <div className="w-20 h-20 rounded-full bg-point/10 flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-point">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
          </div>

          {/* 텍스트 */}
          <p className="text-xl font-bold text-slate-700 tracking-wide">접수 중</p>
          <p className="mt-1.5 text-sm text-slate-400">
            {isUploading ? "사진을 업로드하고 있어요" : "잠시만 기다려주세요"}
          </p>
        </div>
      )}
    </>
  );
}
