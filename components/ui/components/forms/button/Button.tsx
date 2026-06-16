"use client";

import { ButtonHTMLAttributes, ReactNode, Ref } from "react";

import { cn } from "../../../utils/cn";
import {
  formGeometries,
  FormGeometry,
  FormPalette,
  formPalettes,
} from "../../../types/forms";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: FormPalette;
  sizing?: FormGeometry; // size 대신 sizing 사용 (표준 속성과 충돌 방지)
  ref?: Ref<HTMLButtonElement>; // React 19 방식: props로 ref 직접 받기
}

export default function Button({
  children,
  variant = "dark",
  sizing = "md",
  className,
  ref,
  ...rest
}: ButtonProps) {
  // 디자인 시스템에서 정의한 스타일 가져오기
  const variantStyle = formPalettes[variant];
  const sizeStyle = formGeometries[sizing];

  return (
    <button
      ref={ref}
      className={cn(
        "flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyle,
        sizeStyle,
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
