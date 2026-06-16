"use client";

import { useRouter, usePathname } from "next/navigation";

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" fill={active ? "currentColor" : "none"} />
    <path d="M9 21V12h6v9" />
  </svg>
);

const ReceptionIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" fill={active ? "currentColor" : "none"} />
    <path d="M12 8v8M8 12h8" stroke={active ? "white" : "currentColor"} />
  </svg>
);

const ListIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" fill={active ? "currentColor" : "none"} />
    <path d="M7 9h10M7 12h10M7 15h6" stroke={active ? "white" : "currentColor"} />
  </svg>
);

const ExpenseIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" fill={active ? "currentColor" : "none"} />
    <path d="M2 10h20" stroke={active ? "white" : "currentColor"} />
    <path d="M6 15h4M14 15h4" stroke={active ? "white" : "currentColor"} />
  </svg>
);

const MyPageIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" fill={active ? "currentColor" : "none"} />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const NAV_ITEMS = (userId: string) => [
  { label: "홈",       href: "/master",             Icon: HomeIcon },
  { label: "접수하기",  href: "/master/reception",   Icon: ReceptionIcon },
  { label: "리스트",    href: "/master/list",        Icon: ListIcon },
  { label: "지출",      href: "/master/expense",     Icon: ExpenseIcon },
  { label: "마이페이지", href: `/master/${userId}`,   Icon: MyPageIcon },
];

export default function MasterFooterNav({
  userId,
  onNavigate,
}: {
  userId: string;
  onNavigate: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/master") return pathname === "/master";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center z-50">
      {NAV_ITEMS(userId).map(({ label, href, Icon }) => {
        const active = isActive(href);
        return (
          <button
            key={href}
            type="button"
            onClick={() => {
              if (!active) {
                onNavigate();
                router.push(href);
              }
            }}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors touch-manipulation ${
              active ? "text-point" : "text-slate-400"
            }`}
          >
            <Icon active={active} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
