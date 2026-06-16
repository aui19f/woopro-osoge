"use client";

import { useState, KeyboardEvent, useRef } from "react";
import { formGeometries, FormGeometry } from "../../../types/forms";
import { cn } from "../../../utils/cn";

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  sizing?: FormGeometry;
  placeholder?: string;
  className?: string;
}

export default function TagInput({
  tags,
  onTagsChange,
  sizing = "md",
  placeholder,
  className,
}: TagInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const sizeStyle = formGeometries[sizing];

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        onTagsChange([...tags, inputValue.trim()]);
      }
      setInputValue("");
      return;
    }

    if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={cn(
        "flex flex-wrap items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-sm px-2 py-1 transition-all focus-within:border-blue-400 cursor-text",
        sizeStyle,
        "h-auto min-h-[40px]",
        className
      )}
    >
      {tags.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="flex items-center gap-1 bg-accent text-slate-700 px-2 py-0.5 rounded-sm text-xs font-medium animate-in zoom-in-95 duration-200"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(i);
            }}
            className="hover:text-error transition-colors font-bold ml-1"
          >
            ×
          </button>
        </span>
      ))}

      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 bg-transparent border-none outline-none focus:ring-0 p-0 text-inherit min-w-[80px]"
      />
    </div>
  );
}
