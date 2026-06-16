"use client";

import { useEffect, useState } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export default function PushSetup() {
  const [status, setStatus] = useState<"idle" | "granted" | "denied" | "unsupported">("idle");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }

    if (Notification.permission === "granted") {
      setStatus("granted");
      registerAndSubscribe();
      return;
    }

    if (Notification.permission === "denied") {
      setStatus("denied");
    }
  }, []);

  async function registerAndSubscribe() {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const existing = await reg.pushManager.getSubscription();
      if (existing) return;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
    } catch {
      // 등록 실패는 무시
    }
  }

  async function requestPermission() {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setStatus("granted");
      await registerAndSubscribe();
    } else {
      setStatus("denied");
    }
  }

  if (status === "idle" && Notification.permission === "default") {
    return (
      <div className="fixed bottom-20 left-0 right-0 mx-4 max-w-lg md:mx-auto z-30">
        <div className="bg-slate-800 text-white rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-xl">
          <p className="text-sm leading-snug">
            새 접수 알림을 받으시겠어요?
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setStatus("denied")}
              className="text-xs text-slate-400 px-2 py-1"
            >
              나중에
            </button>
            <button
              onClick={requestPermission}
              className="text-xs bg-point text-white px-3 py-1.5 rounded-lg font-semibold"
            >
              허용
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
