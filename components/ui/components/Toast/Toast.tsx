"use client";

export default function Toast({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) {
  return (
    <div
      className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-300 ${
        visible
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="bg-slate-800 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg whitespace-nowrap">
        {message}
      </div>
    </div>
  );
}
