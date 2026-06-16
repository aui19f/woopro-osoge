"use client";

import { FormOption, selectionGeometries, FormGeometry } from "../../../types/forms";
import React, { useId } from "react";
import { cn } from "../../../utils/cn";

interface RadioProps {
  sizing?: FormGeometry;
  options: FormOption[];
  selected: string;
  onChange: (value: string) => void;
  ref?: React.Ref<HTMLInputElement>;
  className?: string;
  children?: React.ReactNode;
}

export default function Radio({
  options,
  selected,
  onChange,
  ref,
  className,
  children,
  sizing = "md",
}: RadioProps) {
  const baseId = useId();
  const sizeStyle = selectionGeometries[sizing];

  const handleToggle = (value: string) => {
    if (selected === value) {
      onChange("");
    } else {
      onChange(value);
    }
  };

  return (
    <div className={cn("flex flex-col", sizeStyle.gap, className)}>
      {options.map((option) => {
        const uniqueId = `${baseId}-${option.id}`;
        const isSelected = selected === option.id;

        return (
          <div key={option.id} className="flex items-center gap-3">
            <label
              htmlFor={uniqueId}
              className="relative flex items-center gap-2 cursor-pointer group"
            >
              <div
                className={cn(
                  "relative flex items-center justify-center border rounded-full transition-all",
                  sizeStyle.box,
                  isSelected
                    ? "border-point bg-white"
                    : "border-slate-300 bg-white"
                )}
              >
                <input
                  id={uniqueId}
                  type="radio"
                  ref={ref}
                  name={baseId}
                  value={option.id}
                  checked={isSelected}
                  onClick={() => handleToggle(option.id)}
                  onChange={() => {}}
                  className="absolute inset-0 opacity-0 cursor-pointer peer"
                />

                <div
                  className={cn(
                    "rounded-full bg-point transition-transform scale-0 pointer-events-none peer-checked:scale-100",
                    sizeStyle.indicator
                  )}
                />
              </div>

              <span
                className={cn(
                  "transition-colors text-slate-700",
                  sizeStyle.text,
                  isSelected && "text-point font-medium"
                )}
              >
                {option.label}
              </span>
            </label>

            {isSelected && children && (
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
