import { updateSession } from "@/lib/supabase/middleware";
import { NextRequest, NextResponse } from "next/server";
import {
  getRoleFromUser,
  getRequiredRole,
  ROLE_DASHBOARDS,
  PUBLIC_AUTH_PATHS,
} from "./middleware.utils";

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;
  console.log("[[[[[user]]]]]", user);
  const role = getRoleFromUser(user);

  // 로그인 상태에서 public 인증 페이지 접근 → 역할 대시보드로 redirect
  if (user && PUBLIC_AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    const destination = role ? ROLE_DASHBOARDS[role] : "/";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // 보호된 경로 접근 처리
  const requiredRole = getRequiredRole(pathname);

  if (requiredRole) {
    // 비로그인 → 로그인 페이지로
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // 역할 불일치 → 자신의 대시보드로 (권한 없음 알림 플래그 포함)
    if (role !== requiredRole) {
      const destination = role ? ROLE_DASHBOARDS[role] : "/login";
      const redirectUrl = new URL(destination, request.url);
      redirectUrl.searchParams.set("unauthorized", "true");
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
