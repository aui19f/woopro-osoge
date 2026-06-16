"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function UnauthorizedAlert() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (searchParams.get("unauthorized") !== "true") return;

    setVisible(true);

    // URL에서 unauthorized 파라미터 제거
    const url = new URL(window.location.href);
    url.searchParams.delete("unauthorized");
    router.replace(url.pathname);

    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [searchParams, router]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-red-500 px-6 py-3 text-white shadow-lg">
      접근 권한이 없습니다.
    </div>
  );
}
