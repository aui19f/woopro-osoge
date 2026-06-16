import { EnumRole } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

// ----------------------------------------------------------------
// Queries
// ----------------------------------------------------------------

export async function findUserById(id: string) {
  return prisma.users.findUnique({ where: { id } });
}

export async function findUserByEmail(email: string) {
  return prisma.users.findUnique({ where: { email } });
}

export async function findUsersByRole(role: EnumRole) {
  return prisma.users.findMany({
    where: { role },
    orderBy: { created_at: "desc" },
  });
}

export async function findFreePlan() {
  return prisma.plan.findUnique({ where: { name: "프리" } });
}

// ----------------------------------------------------------------
// Mutations
// ----------------------------------------------------------------

export async function createUser(data: {
  id: string;       // Supabase auth.users UUID
  email: string;
  nickname?: string;
  planId?: string;
}) {
  return prisma.users.create({ data });
}

/**
 * 역할 변경
 * app_metadata.role 동기화는 호출부(action)에서 admin client로 별도 처리
 */
export async function updateUserRole(id: string, role: EnumRole) {
  return prisma.users.update({ where: { id }, data: { role } });
}

export async function deleteUser(id: string) {
  return prisma.users.delete({ where: { id } });
}
