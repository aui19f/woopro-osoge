"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { compressToWebP } from "./cropUtils";
import ImageEditModal from "./ImageEditModal";

export type StagedImage = { previewUrl: string; blob: Blob };

interface Props {
  images: StagedImage[];
  onChange: (images: StagedImage[]) => void;
  maxCount?: number;
}

export default function ImageUploader({ images, onChange, maxCount = 10 }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editTarget, setEditTarget] = useState<{ src: string; origBlob: Blob } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // 클립보드 붙여넣기
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items ?? []);
      const imageItem = items.find((i) => i.type.startsWith("image/"));
      if (!imageItem) return;
      const file = imageItem.getAsFile();
      if (file) openEditor(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length, maxCount]);

  function openEditor(file: File | Blob) {
    if (images.length >= maxCount) return;
    setEditTarget({ src: URL.createObjectURL(file), origBlob: file });
  }

  async function handleConfirm(blob: Blob) {
    const target = editTarget!;
    const rawBlob = blob.size === 0 ? target.origBlob : blob;
    setEditTarget(null);
    URL.revokeObjectURL(target.src);

    const compressed = await compressToWebP(rawBlob);
    onChange([...images, { previewUrl: URL.createObjectURL(compressed), blob: compressed }]);
  }

  const handleCancel = useCallback(() => {
    setEditTarget((prev) => {
      if (prev) URL.revokeObjectURL(prev.src);
      return null;
    });
  }, []);

  function removeImage(idx: number) {
    const img = images[idx];
    if (img) URL.revokeObjectURL(img.previewUrl);
    onChange(images.filter((_, i) => i !== idx));
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-2">
        {images.map((img, idx) => (
          <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-xs leading-none"
            >
              ×
            </button>
          </div>
        ))}

        {images.length < maxCount && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:border-slate-400 hover:bg-slate-100 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span className="text-xs">추가</span>
          </button>
        )}
      </div>

      <p className="mt-1 text-xs text-slate-400">
        클립보드 붙여넣기(Ctrl+V) 가능 · {images.length}/{maxCount}장
      </p>

      {/* capture 없이 렌더링 — 데스크톱에서도 파일 피커 열리도록 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          Array.from(e.target.files ?? []).forEach((f) => openEditor(f));
          e.target.value = "";
        }}
      />

      {/* 편집 모달: document.body에 포털로 마운트 → z-index/overflow 영향 없음 */}
      {mounted && editTarget &&
        createPortal(
          <ImageEditModal
            imageSrc={editTarget.src}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />,
          document.body
        )
      }
    </>
  );
}
