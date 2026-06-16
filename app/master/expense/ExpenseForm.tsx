"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Spinner from "@/components/ui/components/Spinner/Spinner";
import Toast from "@/components/ui/components/Toast/Toast";
import { useToast } from "@/components/ui/hooks/useToast";
import { registerExpense, type ExpenseState } from "./actions";

type Method = "CARD" | "CASH" | "PAY" | "OTHER";

type Subcategory = {
  id: string;
  name: string;
  description: string | null;
  order: number;
};

type Category = {
  id: string;
  name: string;
  order: number;
  subcategories: Subcategory[];
};

const METHODS: { value: Method; label: string }[] = [
  { value: "CARD",  label: "카드" },
  { value: "CASH",  label: "현금" },
  { value: "PAY",   label: "페이" },
  { value: "OTHER", label: "그외" },
];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function isoToYYYYMMDD(iso: string) { return iso.replace(/-/g, ""); }
function isoToDisplay(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });
}

export default function ExpenseForm({ categories }: { categories: Category[] }) {
  const formRef      = useRef<HTMLFormElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast(2000);

  const [selectedDate,    setSelectedDate]    = useState(todayISO());
  const [amount,          setAmount]          = useState("");
  const [method,          setMethod]          = useState<Method | null>(null);
  const [memo,            setMemo]            = useState("");
  const [selectedCatId,   setSelectedCatId]   = useState<string>("");
  const [selectedSubId,   setSelectedSubId]   = useState<string>("");
  const [helpOpen,        setHelpOpen]        = useState(false);

  const [state, formAction, isPending] = useActionState<ExpenseState, FormData>(
    registerExpense,
    null
  );

  const dateYYYYMMDD = isoToYYYYMMDD(selectedDate);
  const displayDate  = isoToDisplay(selectedDate);
  const isValid      = !!amount && !!method;

  const selectedCat = categories.find((c) => c.id === selectedCatId);
  const subcategories = selectedCat?.subcategories ?? [];

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "").replace(/\D/g, "");
    const num = raw ? parseInt(raw) : "";
    setAmount(num === "" ? "" : num.toLocaleString("ko-KR"));
  };

  const handleCatChange = (id: string) => {
    setSelectedCatId(id);
    setSelectedSubId("");
  };

  useEffect(() => {
    if (state?.status === 200) {
      setAmount("");
      setMethod(null);
      setMemo("");
      setSelectedCatId("");
      setSelectedSubId("");
      toast.show("등록되었습니다");
    }
  }, [state, toast.show]);

  return (
    <>
      <form ref={formRef} action={formAction} className="sr-only" aria-hidden>
        <input name="date"          value={dateYYYYMMDD}     readOnly />
        <input name="amount"        value={amount}           readOnly />
        <input name="method"        value={method ?? ""}     readOnly />
        <input name="subcategoryId" value={selectedSubId}    readOnly />
        <textarea name="memo"       value={memo}             readOnly />
      </form>

      <div className="min-h-screen bg-slate-50 pb-24">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 bg-white border-b border-slate-100 sticky top-0 z-10">
          <p className="font-bold text-slate-800 text-lg">지출 등록</p>
          <Link
            href="/master/expense/list"
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-point transition-colors"
          >
            리스트
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="mx-4 mt-5 flex flex-col gap-4">
          {/* 날짜 */}
          <div className="bg-white rounded-2xl px-5 py-4 border border-slate-100">
            <label className="text-xs text-slate-400 block mb-1.5">날짜</label>
            <div
              className="relative cursor-pointer"
              onClick={() => dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.click()}
            >
              <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                {displayDate}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </p>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                max={todayISO()}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full"
                tabIndex={-1}
              />
            </div>
          </div>

          {/* 카테고리 */}
          <div className="bg-white rounded-2xl px-5 py-4 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-400">분류</label>
              <div className="flex items-center gap-2">
                <Link
                  href="/master/expense/categories"
                  className="text-xs text-slate-400 hover:text-point transition-colors"
                >
                  관리
                </Link>
                <button
                  type="button"
                  onClick={() => setHelpOpen(true)}
                  className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors"
                  aria-label="도움말"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <circle cx="12" cy="17" r="0.5" fill="currentColor" />
                  </svg>
                </button>
              </div>
            </div>
            {/* 대분류 */}
            <div className="flex flex-wrap gap-2 mb-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCatChange(selectedCatId === cat.id ? "" : cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    selectedCatId === cat.id
                      ? "bg-point text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {/* 중분류 */}
            {subcategories.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
                {subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedSubId(selectedSubId === sub.id ? "" : sub.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      selectedSubId === sub.id
                        ? "bg-blue-500 text-white"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 금액 */}
          <div className="bg-white rounded-2xl px-5 py-4 border border-slate-100">
            <label className="text-xs text-slate-400 block mb-1.5">금액</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-slate-800 text-xl font-semibold focus:outline-none focus:border-blue-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">원</span>
            </div>
          </div>

          {/* 결제 방법 */}
          <div className="bg-white rounded-2xl px-5 py-4 border border-slate-100">
            <label className="text-xs text-slate-400 block mb-2">방법</label>
            <div className="flex gap-2">
              {METHODS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMethod(method === value ? null : value)}
                  className={`flex-1 h-11 rounded-xl text-sm font-semibold transition-colors ${
                    method === value
                      ? "bg-point text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 메모 */}
          <div className="bg-white rounded-2xl px-5 py-4 border border-slate-100">
            <label className="text-xs text-slate-400 block mb-2">메모</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="내용을 입력하세요"
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 text-sm resize-none focus:outline-none focus:border-blue-400 leading-relaxed"
            />
          </div>

          {/* 에러 */}
          {state && state.status !== 200 && (
            <p className="text-center text-sm text-error">{state.message}</p>
          )}

          {/* 등록 버튼 */}
          <button
            type="button"
            onClick={() => formRef.current?.requestSubmit()}
            disabled={!isValid || isPending}
            className={`w-full h-14 rounded-2xl text-lg font-bold transition-all flex items-center justify-center gap-2 ${
              isValid && !isPending
                ? "bg-point text-white shadow-lg active:scale-95"
                : "bg-slate-100 text-slate-300 cursor-not-allowed"
            }`}
          >
            {isPending ? <><Spinner size={20} />저장 중...</> : "등록하기"}
          </button>
        </div>
      </div>

      {/* 도움말 팝업 */}
      {helpOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end"
          onClick={() => setHelpOpen(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl px-5 pt-5 pb-10 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-slate-800 text-base">분류 안내</p>
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {categories.map((cat) => (
                <div key={cat.id}>
                  <p className="text-xs font-bold text-point mb-1.5">{cat.name}</p>
                  <div className="flex flex-col gap-1.5">
                    {cat.subcategories.map((sub) => (
                      <div key={sub.id} className="flex gap-2">
                        <span className="text-xs font-semibold text-slate-600 shrink-0 w-20">{sub.name}</span>
                        <span className="text-xs text-slate-400 leading-relaxed">{sub.description ?? ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}
