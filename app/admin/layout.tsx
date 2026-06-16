import { Suspense } from "react";
import UnauthorizedAlert from "@/app/components/UnauthorizedAlert";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense>
        <UnauthorizedAlert />
      </Suspense>
      {children}
    </>
  );
}
