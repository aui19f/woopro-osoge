"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Spinner from "@/components/ui/components/Spinner/Spinner";
import MasterFooterNav from "./MasterFooterNav";

export default function MasterLayoutClient({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) {
  const pathname = usePathname();
  const isKiosk = pathname.startsWith("/master/reception/kiosk");
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => { setIsNavigating(false); }, [pathname]);

  return (
    <>
      <main className={`relative flex-1 overflow-y-auto ${isKiosk ? "" : "pb-16"}`}>
        {children}

        {isNavigating && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/75 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-2.5">
              <Spinner size={36} className="text-point" />
              <span className="text-sm font-medium text-slate-500">이동 중</span>
            </div>
          </div>
        )}
      </main>
      {!isKiosk && (
        <MasterFooterNav
          userId={userId}
          onNavigate={() => setIsNavigating(true)}
        />
      )}
    </>
  );
}
