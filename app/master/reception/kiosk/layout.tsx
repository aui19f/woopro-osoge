import KioskGuard from "../_components/KioskGuard";

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <KioskGuard>{children}</KioskGuard>;
}
