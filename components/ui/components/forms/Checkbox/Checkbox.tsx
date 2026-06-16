"use client";

import React, { useId } from "react";
import { FormOption, selectionGeometries, FormGeometry } from "../../../types/forms";
import { cn } from "../../../utils/cn";

interface CheckboxProps {
  sizing?: FormGeometry;
  options: FormOption[];
  selected: string[];
  onChange: (value: string) => void;
  ref?: React.Ref<HTMLInputElement>;
  className?: string;
  children?: React.ReactNode;
}

export default function Checkbox({
  options,
  selected,
  onChange,
  ref,
  className,
  children,
  sizing = "md",
}: CheckboxProps) {
  const baseId = useId();
  const styles = selectionGeometries[sizing];

  return (
    <div className={cn("flex flex-col", styles.gap, className)}>
      {options.map((option) => {
        const uniqueId = `${baseId}-${option.id}`;
        const isChecked = selected.includes(option.id);

        return (
          <div key={option.id} className="flex items-center gap-3">
            <label
              htmlFor={uniqueId}
              className="relative flex items-center gap-2 cursor-pointer group"
            >
              <div
                className={cn(
                  "relative flex items-center justify-center border rounded transition-all",
                  styles.box,
                  isChecked
                    ? "bg-point border-point"
                    : "border-slate-300 bg-white"
                )}
              >
                <input
                  id={uniqueId}
                  type="checkbox"
                  ref={ref}
                  value={option.id}
                  checked={isChecked}
                  onChange={(e) => onChange(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer peer"
                />

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={cn(
                    "text-white transition-opacity opacity-0 pointer-events-none peer-checked:opacity-100",
                    styles.indicator
                  )}
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path
                    d="M5 10l3 3l7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <span
                className={cn(
                  "transition-colors text-slate-700",
                  styles.text,
                  isChecked && "text-point font-medium"
                )}
              >
                {option.label}
              </span>
            </label>

            {isChecked && children && (
              <div className="flex-1 animate-in fade-in slide-in-from-left-1">
                {children}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
