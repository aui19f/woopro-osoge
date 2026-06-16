import {
  EnumPaymentMethod,
  EnumPaymentTiming,
  EnumReceptionStatus,
} from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export type { EnumReceptionStatus, EnumPaymentTiming, EnumPaymentMethod };

// ----------------------------------------------------------------
// Queries
// ----------------------------------------------------------------

export async function countTodayReceptions(date: string) {
  return prisma.reception.count({ where: { date } });
}

export async function sumReceptionAmountByMonth(yyyymm: string): Promise<number> {
  const lastDay = new Date(parseInt(yyyymm.slice(0, 4)), parseInt(yyyymm.slice(4, 6)), 0).getDate();
  const result = await prisma.reception.aggregate({
    where: {
      date: { gte: `${yyyymm}01`, lte: `${yyyymm}${String(lastDay).padStart(2, "0")}` },
      status: { not: "CANCELLED" },
    },
    _sum: { payment_amount: true },
  });
  return result._sum.payment_amount ?? 0;
}

export async function receptionSummaryByDay(
  yyyymm: string
): Promise<Record<string, { amount: number; count: number }>> {
  const lastDay = new Date(parseInt(yyyymm.slice(0, 4)), parseInt(yyyymm.slice(4, 6)), 0).getDate();
  const rows = await prisma.reception.groupBy({
    by: ["date"],
    where: {
      date: { gte: `${yyyymm}01`, lte: `${yyyymm}${String(lastDay).padStart(2, "0")}` },
      status: { not: "CANCELLED" },
    },
    _sum: { payment_amount: true },
    _count: { id: true },
  });
  return Object.fromEntries(
    rows.map((r) => [r.date, { amount: r._sum.payment_amount ?? 0, count: r._count.id }])
  );
}

// Returns the next available sequence number for a given date by looking at
// the highest existing ID (avoids gaps from deletions and count-based races).
export async function getNextReceptionId(date: string): Promise<string> {
  const latest = await prisma.reception.findFirst({
    where: { id: { startsWith: date } },
    orderBy: { id: "desc" },
    select: { id: true },
  });
  const seq = latest ? parseInt(latest.id.slice(date.length)) + 1 : 1;
  return `${date}${String(seq).padStart(3, "0")}`;
}

export async function findReceptionById(id: string) {
  return prisma.reception.findUnique({ where: { id } });
}

export async function findReceptions(params: {
  fromDate?: string;           // YYYYMMDD
  toDate?: string;             // YYYYMMDD
  status?: EnumReceptionStatus[];
  storeId?: string;
  sortField?: "date" | "created";
  sortDir?: "asc" | "desc";
  postpaidOnly?: boolean;      // 후불이고 금액 미정인 항목만
}) {
  const field  = params.sortField ?? "created";
  const dir    = params.sortDir   ?? "desc";
  const orderBy = field === "date" ? { date: dir } : { created_at: dir };

  return prisma.reception.findMany({
    where: {
      ...(params.fromDate || params.toDate
        ? {
            date: {
              ...(params.fromDate && { gte: params.fromDate }),
              ...(params.toDate && { lte: params.toDate }),
            },
          }
        : {}),
      ...(params.status?.length ? { status: { in: params.status } } : {}),
      ...(params.storeId ? { storeId: params.storeId } : {}),
      ...(params.postpaidOnly
        ? { payment_timing: "POSTPAID", payment_amount: null }
        : {}),
    },
    orderBy,
  });
}

// ----------------------------------------------------------------
// Mutations
// ----------------------------------------------------------------

export async function createReception(data: {
  id: string;
  phone: string;
  date: string;
  time: string;
  agreed: boolean;
  status?: EnumReceptionStatus;
  storeId?: string;
}) {
  return prisma.reception.create({ data });
}

export async function updateReceptionStatus(
  id: string,
  status: EnumReceptionStatus
) {
  return prisma.reception.update({ where: { id }, data: { status } });
}

export async function updateReceptionPayment(
  id: string,
  data: {
    payment_amount?: number;
    payment_timing?: EnumPaymentTiming;
    payment_method?: EnumPaymentMethod;
    quantity?: number;
  }
) {
  return prisma.reception.update({ where: { id }, data });
}

export async function updateReceptionImages(id: string, images: string[]) {
  return prisma.reception.update({ where: { id }, data: { images } });
}

export async function incrementMessageSentCount(id: string) {
  return prisma.reception.update({
    where: { id },
    data: { message_sent_count: { increment: 1 } },
  });
}

export async function createAdminReception(data: {
  id: string;
  phone?: string;
  name?: string;
  date: string;
  time: string;
  quantity: number;
  payment_amount?: number;
  payment_timing?: EnumPaymentTiming;
  memo?: string;
  deadline?: string;
  storeId?: string;
  images?: string[];
}) {
  return prisma.reception.create({ data: { ...data, agreed: true } });
}

export async function updateReceptionDetail(
  id: string,
  data: {
    status?: EnumReceptionStatus;
    payment_amount?: number | null;
    payment_timing?: EnumPaymentTiming | null;
    payment_method?: EnumPaymentMethod | null;
    quantity?: number;
    memo?: string | null;
    deadline?: string | null;
    updated_by?: string;
    storeId?: string;
  }
) {
  return prisma.reception.update({ where: { id }, data });
}

export async function findDuplicatePhoneToday(phone: string, date: string) {
  // 입력된 번호의 마스킹 버전 (010-****-1234) 도 함께 조회
  const maskedPhone = phone.replace(/-\d{3,4}-/, "-****-");

  return prisma.reception.findMany({
    where: {
      date,
      OR: [
        { phone },
        ...(maskedPhone !== phone ? [{ phone: maskedPhone }] : []),
      ],
    },
    select: { id: true, time: true, name: true, phone: true },
    orderBy: { created_at: "desc" },
  });
}
