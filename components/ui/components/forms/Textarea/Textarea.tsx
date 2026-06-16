"use client";

import { useRef, useEffect, useImperativeHandle } from "react";
import { formGeometries, FormGeometry } from "../../../types/forms";
import { cn } from "../../../utils/cn";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  sizing?: FormGeometry;
  autoResize?: boolean;
  isError?: boolean;
  ref?: React.Ref<HTMLTextAreaElement>;
}

export default function Textarea({
  name,
  sizing = "md",
  autoResize = false,
  isError = false,
  className,
  value,
  ref,
  onChange,
  ...rest
}: TextareaProps) {
  const innerRef = useRef<HTMLTextAreaElement>(null);
  const sizeStyle = formGeometries[sizing];

  useImperativeHandle(
    ref,
    () => innerRef.current ?? document.createElement("textarea")
  );

  useEffect(() => {
    if (autoResize && innerRef.current) {
      const el = innerRef.current;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [value, autoResize]);

  return (
    <div className="w-full">
      <textarea
        name={name}
        ref={innerRef}
        value={value}
        onChange={onChange}
        {...rest}
        className={cn(
          "w-full transition-all outline-none",
          "focus:border-blue-500",
          sizeStyle,
          autoResize ? "overflow-hidden resize-none" : "resize-y",
          isError && "border-error",
          className
        )}
        rows={rest.rows || 3}
      />
    </div>
  );
}
