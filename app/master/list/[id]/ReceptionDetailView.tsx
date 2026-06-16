"use client";

import { useState, useTransition } from "react";
import Input from "@/components/ui/components/forms/input/Input";
import Checkbox from "@/components/ui/components/forms/Checkbox/Checkbox";
import { saveDetail, sendAndSaveDetail } from "@/app/master/@modal/(.)list/[id]/actions";
import { deleteReceptionImage } from "@/app/master/@modal/(.)list/[id]/imageActions";

type Status = "WAITING" | "READY" | "IN_PROGRESS" | "DONE" | "CANCELLED";
type PaymentTiming = "PREPAID" | "POSTPAID";
type PaymentMethod = "CARD" | "CASH" | "TRANSFER" | "GIFT_VOUCHER" | "OTHER";

export type ReceptionDetail = {
  id: string;
  phone: string | null;
  name: string | null;
  date: string;
  time: string;
  status: Status;
  message_sent_count: number;
  reception_link_sent_count?: number;
  payment_amount: number | null;
  payment_timing: PaymentTiming | null;
  payment_method: PaymentMethod | null;
  quantity: number;
  memo: string | null;
  images: string[];
};

const STATUS_TABS: { value: Status; label: string; active: string }[] = [
  { value: "WAITING",     label: "대기", active: "bg-purple-100 text-purple-600 border-purple-300" },
  { value: "READY",       label: "준비", active: "bg-blue-100 text-blue-600 border-blue-300" },
  { value: "IN_PROGRESS", label: "진행", active: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { value: "DONE",        label: "완료", active: "bg-green-100 text-green-700 border-green-300" },
  { value: "CANCELLED",   label: "취소", active: "bg-red-100 text-red-600 border-red-300" },
];

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  CARD: "카드",
  CASH: "현금",
  TRANSFER: "계좌",
  GIFT_VOUCHER: "상품권",
  OTHER: "기타",
};

function formatDate(d: string) {
  if (d.length !== 8) return d;
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6)}`;
}

function formatTime(t: string) {
  return t.slice(0, 5);
}

function calcDaysElapsed(dateStr: string) {
  const y = parseInt(dateStr.slice(0, 4), 10);
  const m = parseInt(dateStr.slice(4, 6), 10) - 1;
  const d = parseInt(dateStr.slice(6, 8), 10);
  const reception = new Date(y, m, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  reception.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - reception.getTime()) / 86400000);
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      {children}
    </div>
  );
}

export default function ReceptionDetailView({
  reception,
  onClose,
  onSaved,
  mode,
}: {
  reception: ReceptionDetail;
  onClose: () => void;
  onSaved?: () => void;
  mode: "modal" | "page";
}) {
  const [isPending, startTransition] = useTransition();

  const [status, setStatus] = useState<Status>(reception.status);
  const [quantity, setQuantity] = useState(reception.quantity.toString());
  const [paymentTiming, setPaymentTiming] = useState<PaymentTiming | null>(reception.payment_timing);
  const [paymentAmount, setPaymentAmount] = useState(reception.payment_amount?.toString() ?? "");
  const [sendMessage, setSendMessage] = useState(false);
  const [memo, setMemo] = useState(reception.memo ?? "");
  const [images, setImages] = useState<string[]>(reception.images);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const displayAmount = paymentAmount
    ? Number(paymentAmount).toLocaleString("ko-KR")
    : "";

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPaymentAmount(e.target.value.replace(/[^0-9]/g, ""));
  }

  const daysElapsed = calcDaysElapsed(reception.date);
  const hasPayment = reception.payment_amount !== null;

  function buildData() {
    return {
      status,
      quantity: quantity ? parseInt(quantity, 10) : 1,
      paymentTiming,
      paymentMethod: reception.payment_method,
      paymentAmount: paymentAmount ? parseInt(paymentAmount, 10) : null,
      memo,
    };
  }

  const afterSave = onSaved ?? onClose;

  function handleSave() {
    startTransition(async () => {
      await saveDetail(reception.id, buildData());
      afterSave();
    });
  }

  function handleSendAndSave() {
    startTransition(async () => {
      await sendAndSaveDetail(reception.id, buildData());
      afterSave();
    });
  }

  return (
    <>
      {/* 헤더 */}
      <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 shrink-0">
        {mode === "page" ? (
          <div>
            <button
              onClick={onClose}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-1"
            >
              ← 목록으로
            </button>
            <p className="text-xs text-slate-400">접수번호</p>
            <h2 className="text-lg font-bold tracking-wide text-slate-800 font-mono">
              {reception.id}
            </h2>
          </div>
        ) : (
          <>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">접수번호</p>
              <h2 className="text-lg font-bold tracking-wide text-slate-800 font-mono">
                {reception.id}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors mt-1"
            >
              ✕
            </button>
          </>
        )}
      </div>

      {/* 바디 */}
      <div className="px-6 py-5 space-y-6 flex-1 overflow-y-auto">
        {/* 기본 정보 */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm items-center">
          <span className="text-slate-500">
            접수일{" "}
            <span className="text-slate-800 font-medium">{formatDate(reception.date)}</span>
          </span>
          <span className="text-slate-500">
            접수시간{" "}
            <span className="text-slate-800 font-medium">{formatTime(reception.time)}</span>
          </span>
          <span className="font-semibold text-point">D+{daysElapsed}일</span>
        </div>

        <div className="text-sm flex items-center gap-3">
          {reception.phone ? (
            <>
              <span className="text-slate-400">연락처</span>
              <span className="text-slate-800 font-medium">{reception.phone}</span>
            </>
          ) : (
            <>
              <span className="text-slate-400">이름</span>
              <span className="text-slate-800 font-medium">{reception.name ?? "-"}</span>
            </>
          )}
        </div>

        {/* 상태 */}
        <Section label="상태">
          <div className="flex gap-2">
            {STATUS_TABS.map(({ value, label, active }) => (
              <button
                key={value}
                onClick={() => setStatus(value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  status === value
                    ? active
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Section>

        {/* 내역 */}
        <Section label="내역">
          {hasPayment ? (
            <p className="text-sm text-slate-800">
              {reception.payment_amount!.toLocaleString()}원
              {reception.payment_method &&
                ` · ${PAYMENT_METHOD_LABEL[reception.payment_method]}`}
              {` · ${reception.quantity}건`}
            </p>
          ) : (
            <p className="text-sm text-slate-400">-</p>
          )}
        </Section>

        {/* 지불방법 */}
        <Section label="지불방법">
          <div className="flex gap-2">
            {(
              [
                ["PREPAID", "선불"],
                ["POSTPAID", "후불"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setPaymentTiming(paymentTiming === value ? null : value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  paymentTiming === value
                    ? "bg-point/10 text-point border-point/30"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Section>

        {/* 수량 */}
        <Section label="수량">
          <div className="flex items-center gap-2">
            <div className="w-24">
              <Input
                name="quantity"
                type="text"
                inputMode="numeric"
                sizing="sm"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value.replace(/[^0-9]/g, ""))}
                onBlur={() => { if (!quantity || quantity === "0") setQuantity("1"); }}
                placeholder="1"
                className="text-right"
              />
            </div>
            <span className="text-sm text-slate-500">건</span>
          </div>
        </Section>

        {/* 총액 */}
        <Section label="총액">
          <div className="flex items-center gap-2">
            <div className="w-40">
              <Input
                name="payment_amount"
                type="text"
                inputMode="numeric"
                sizing="sm"
                value={displayAmount}
                onChange={handleAmountChange}
                placeholder="0"
                className="text-right"
              />
            </div>
            <span className="text-sm text-slate-500">원</span>
          </div>
        </Section>

        {/* 완료메시지 */}
        <div className="flex items-center gap-3">
          <Checkbox
            sizing="sm"
            options={[{ id: "send", label: "완료메시지 전송" }]}
            selected={sendMessage ? ["send"] : []}
            onChange={() => setSendMessage((prev) => !prev)}
          />
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {reception.message_sent_count > 0 ? `${reception.message_sent_count}번전송` : "미전송"}
          </span>
        </div>

        {/* 메모 */}
        <Section label="메모">
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            placeholder="메모를 입력하세요"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 resize-none"
          />
        </Section>

        {/* 사진 */}
        {images.length > 0 && (
          <Section label="사진">
            <div className="flex flex-wrap gap-2">
              {images.map((url, idx) => (
                <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setLightboxIdx(idx)}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm("이 사진을 삭제하시겠어요?")) return;
                      await deleteReceptionImage(reception.id, url);
                      setImages((prev) => prev.filter((u) => u !== url));
                    }}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* 라이트박스 */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIdx(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[lightboxIdx]}
            alt=""
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 text-white text-2xl w-10 h-10 flex items-center justify-center"
            onClick={() => setLightboxIdx(null)}
          >
            ✕
          </button>
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl w-10 h-10 flex items-center justify-center"
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => ((i ?? 0) - 1 + images.length) % images.length); }}
              >‹</button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl w-10 h-10 flex items-center justify-center"
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => ((i ?? 0) + 1) % images.length); }}
              >›</button>
            </>
          )}
        </div>
      )}

      {/* 푸터 */}
      <div className="flex items-center justify-between px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-slate-100 shrink-0 bg-white gap-2">
        <button
          onClick={onClose}
          disabled={isPending}
          className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-40 shrink-0"
        >
          취소
        </button>
        <div className="flex gap-1.5">
          {/* 접수전송 — UI only */}
          <button
            type="button"
            disabled
            className="px-3 py-2 text-xs font-medium bg-slate-100 text-slate-400 rounded-lg cursor-not-allowed shrink-0"
          >
            접수전송{(reception.reception_link_sent_count ?? 0) > 0 && `(${reception.reception_link_sent_count})`}
          </button>
          <button
            onClick={handleSendAndSave}
            disabled={isPending}
            className="px-3 py-2 text-xs font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors shrink-0"
          >
            전송&저장
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium bg-point text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-colors shrink-0"
          >
            저장
          </button>
        </div>
      </div>
    </>
  );
}
