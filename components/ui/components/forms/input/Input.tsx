"use client";

import React from "react";

import Image from "next/image";
import { cn } from "../../../utils/cn";
import { formGeometries, FormGeometry } from "../../../types/forms";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  sizing?: FormGeometry;
  isError?: boolean;
  icon?: string;
  ref?: React.Ref<HTMLInputElement>;
}

export default function Input({
  className,
  sizing = "md",
  isError,
  icon,
  ref, // 이제 구조 분해 할당으로 직접 받습니다.
  ...props
}: InputProps) {
  const sizeStyles = formGeometries[sizing];
  return (
    <div className="relative w-full group">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
          <Image
            src={`/images/icons/${icon}.png`}
            alt={props.name || "-"}
            width={24}
            height={24}
          />
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full border rounded-md transition-all outline-none focus:ring-2",
          "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20",
          sizeStyles,
          icon && "pl-10",
          isError &&
            "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
    </div>
  );
}
