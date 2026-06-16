"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { receptionSchema } from "@/schemas/reception";
import {
  createReception,
  createAdminReception,
  countTodayReceptions,
  getNextReceptionId,
  findDuplicatePhoneToday,
} from "@/services/reception";
import { EnumPaymentTiming } from "@/generated/prisma";
import { sendPushToAll } from "@/lib/webpush";

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type PrintData = {
  id: string;
  phone: string;
  dateLabel: string; // YYYY년 MM월 DD일
  timeLabel: string; // 오전/오후 HH시 mm분
};

export type ReceptionState = {
  status: number;
  message: string;
  printData?: PrintData;
} | null;

function buildPrintData(id: string, phone: string, date: string, time: string): PrintData {
  const dateLabel = `${date.slice(0, 4)}년 ${date.slice(4, 6)}월 ${date.slice(6, 8)}일`;
  const [hh = "0", mm = "0"] = time.split(":");
  const hour = parseInt(hh);
  const ampm = hour < 12 ? "오전" : "오후";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const timeLabel = `${ampm} ${displayHour}시 ${mm}분`;

  // 서버 로그 (임시 출력)
  console.log(`[출력] 접수번호: ${id} | ${dateLabel} ${timeLabel} | ${phone}`);

  return { id, phone, dateLabel, timeLabel };
}

export async function registerReception(
  _prev: ReceptionState,
  formData: FormData
): Promise<ReceptionState> {
  // 1. 유효성 검사
  const phone = formData.get("phone") as string;
  const agreed = formData.get("agreed") === "true";

  const result = receptionSchema.safeParse({ phone, agreed });
  if (!result.success) {
    return {
      status: 400,
      message: result.error.errors[0]?.message ?? "입력값을 확인해주세요.",
    };
  }

  // 2. 날짜·시간 추출
  const now = new Date();
  // 한국 시간 기준 YYYYMMDD
  const date = now
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, "")
    .replace(".", "");
  const time = now.toTimeString().slice(0, 8);

  // 3. 당일 순번 계산 → ID 생성 (max 기반, 충돌 시 재시도)
  for (let attempt = 0; attempt < 10; attempt++) {
    const id = await getNextReceptionId(date);
    try {
      await createReception({
        id,
        phone: result.data.phone,
        date,
        time,
        agreed: result.data.agreed ?? false,
        status: "WAITING",
      });
      sendPushToAll({
        title: "새 접수 대기",
        body: `${buildPrintData(id, result.data.phone, date, time).dateLabel} · 접수번호 ${id.slice(-3)}`,
        url: "/master/reception/waiting",
      }).catch(() => {});

      return {
        status: 200,
        message: "성공",
        printData: buildPrintData(id, result.data.phone, date, time),
      };
    } catch (error: unknown) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === "P2002") continue;
      console.error("registerReception error:", error);
      return { status: 401, message: "실패" };
    }
  }
  return { status: 500, message: "ID 생성 실패" };
}

function getTodayKST() {
  const now = new Date();
  const date = now
    .toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
    .replace(/\. /g, "")
    .replace(".", "");
  const time = now.toTimeString().slice(0, 8);
  return { date, time };
}

export async function getCountByDate(dateYYYYMMDD: string): Promise<number> {
  return countTodayReceptions(dateYYYYMMDD);
}

export async function adminRegisterReception(
  _prev: ReceptionState,
  formData: FormData
): Promise<ReceptionState> {
  const phone = (formData.get("phone") as string) || undefined;
  const name = (formData.get("name") as string) || undefined;
  const rawAmount = formData.get("amount") as string;
  const payment_amount = rawAmount ? parseInt(rawAmount.replace(/,/g, "")) : undefined;
  const rawTiming = formData.get("paymentTiming") as string | null;
  const payment_timing =
    rawTiming === "PREPAID" || rawTiming === "POSTPAID"
      ? (rawTiming as EnumPaymentTiming)
      : undefined;
  const memo     = (formData.get("memo") as string) || undefined;
  const rawDeadline = (formData.get("deadline") as string) || "";
  const deadline = /^\d{8}$/.test(rawDeadline) ? rawDeadline : undefined;
  const images = formData.getAll("images").filter(Boolean) as string[];

  const adminPhoneRegex = /^\d{3}-(\d{3,4}|\*{4})-\d{4}$/;

  const phoneProvided = !!phone && adminPhoneRegex.test(phone);
  const nameProvided = !!name?.trim();

  if (!phoneProvided && !nameProvided) {
    return { status: 400, message: "전화번호 또는 이름을 입력해주세요." };
  }
  if (phone && !adminPhoneRegex.test(phone)) {
    return { status: 400, message: "올바른 전화번호 형식을 확인해주세요." };
  }

  const rawDate = formData.get("date") as string;
  const { date: todayDate, time } = getTodayKST();
  const date = /^\d{8}$/.test(rawDate) ? rawDate : todayDate;

  const quantity = Math.max(1, parseInt(formData.get("quantity") as string) || 1);

  for (let attempt = 0; attempt < 10; attempt++) {
    const id = await getNextReceptionId(date);
    try {
      await createAdminReception({
        id,
        phone: phoneProvided ? phone : undefined,
        name: name?.trim() || undefined,
        date,
        time,
        quantity,
        payment_amount,
        payment_timing,
        memo,
        deadline,
        images: images.length ? images : undefined,
      });
      return { status: 200, message: "성공" };
    } catch (error: unknown) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === "P2002") continue;
      console.error("adminRegisterReception error:", error);
      return { status: 500, message: "저장 실패" };
    }
  }
  return { status: 500, message: "ID 생성 실패" };
}

export async function checkDuplicatePhone(
  phone: string,
  date: string
): Promise<{ id: string; time: string; name: string | null; phone: string | null }[]> {
  return findDuplicatePhoneToday(phone, date);
}
