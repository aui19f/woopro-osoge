import type { Metadata } from "next";
import "./globals.css";
import NavigationProgress from "./components/NavigationProgress";

export const metadata: Metadata = {
  title: "오소게 | 접수시스템",
  description: "오소게 접수 관리 시스템",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="오소게" />
        <link rel="apple-touch-icon" href="/images/osoge_main_01.png" />
      </head>
      <body>
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}
