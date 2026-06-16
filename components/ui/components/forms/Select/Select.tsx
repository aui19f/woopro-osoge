"use client";

import { Ref, SelectHTMLAttributes } from "react";
import { formGeometries, FormGeometry, FormOption } from "../../../types/forms";
import { cn } from "../../../utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: FormOption[];
  sizing?: FormGeometry;
  selected: string;
  isError?: boolean;
  ref?: Ref<HTMLSelectElement>;
}

export default function Select({
  options,
  selected,
  sizing = "md",
  isError = false,
  className,
  ref,
  children, // 기본 option 외에 직접 주입할 경우 대비
  ...rest
}: SelectProps) {
  const sizeStyle = formGeometries[sizing];

  return (
    <div className="w-full">
      <div className="relative flex items-center">
        <select
          ref={ref}
          value={selected}
          {...rest}
          className={cn(
            "w-full appearance-none transition-all outline-none ",
            "pr-10", // 화살표 아이콘 공간 확보
            sizeStyle,
            isError && "border-error",
            className
          )}
        >
          {/* placeholder가 필요한 경우를 위해 비어있는 옵션 처리 가능 */}
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
          {children}
        </select>

        {/* 커스텀 화살표 아이콘 */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className={cn(
              "w-5 h-5 transition-colors",
              isError ? "text-error" : "text-slate-400"
            )}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
