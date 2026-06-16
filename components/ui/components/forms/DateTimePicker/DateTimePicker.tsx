"use client";

import { FormGeometry, formGeometries } from "../../../types/forms";
import { cn } from "../../../utils/cn";

type PickerMode = "date" | "time" | "datetime";

type DateTimeValue = string | { start: string; end: string };

interface DateTimePickerProps {
  mode: PickerMode;
  isRange?: boolean;
  value: DateTimeValue;
  onChange: (value: DateTimeValue) => void;
  sizing?: FormGeometry;
  className?: string;
  isError?: boolean;
}

export default function DateTimePicker({
  mode,
  isRange = false,
  value,
  onChange,
  sizing = "md",
  className,
  isError = false,
}: DateTimePickerProps) {
  const sizeStyle = formGeometries[sizing];

  const inputType = mode === "datetime" ? "datetime-local" : mode;

  if (!isRange) {
    return (
      <input
        type={inputType}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full outline-none transition-all",
          sizeStyle,
          isError && "border-error",
          className
        )}
      />
    );
  }

  const rangeValue = typeof value === "object" ? value : { start: "", end: "" };

  return (
    <div className={cn("flex items-center gap-2 w-full", className)}>
      <input
        type={inputType}
        value={rangeValue.start}
        onChange={(e) => onChange({ ...rangeValue, start: e.target.value })}
        className={cn(
          "flex-1 outline-none transition-all",
          sizeStyle,
          isError && "border-error"
        )}
      />
      <span className="text-slate-400 text-sm font-bold">~</span>
      <input
        type={inputType}
        value={rangeValue.end}
        onChange={(e) => onChange({ ...rangeValue, end: e.target.value })}
        className={cn(
          "flex-1 outline-none transition-all",
          sizeStyle,
          isError && "border-error"
        )}
      />
    </div>
  );
}
