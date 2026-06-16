"use client";

import "react-easy-crop/react-easy-crop.css";
import { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { getCroppedBlob } from "./cropUtils";

interface Props {
  imageSrc: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

const RATIOS = [
  { label: "자유", value: undefined },
  { label: "16:9", value: 16 / 9 },
  { label: "4:3",  value: 4 / 3 },
  { label: "1:1",  value: 1 },
  { label: "3:4",  value: 3 / 4 },
  { label: "9:16", value: 9 / 16 },
] as const;

function FreeDrawCrop({
  imageSrc,
  onAreaChange,
}: {
  imageSrc: string;
  onAreaChange: (area: Area | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgNatural, setImgNatural] = useState<{ w: number; h: number } | null>(null);
  const [selection, setSelection] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const onAreaChangeRef = useRef(onAreaChange);
  useEffect(() => { onAreaChangeRef.current = onAreaChange; }, [onAreaChange]);

  function getBounds() {
    const c = containerRef.current;
    if (!c || !imgNatural) return null;
    const cW = c.clientWidth;
    const cH = c.clientHeight;
    const scale = Math.min(cW / imgNatural.w, cH / imgNatural.h);
    const rW = imgNatural.w * scale;
    const rH = imgNatural.h * scale;
    return { scale, offsetX: (cW - rW) / 2, offsetY: (cH - rH) / 2 };
  }

  function toImageCoords(sx: number, sy: number) {
    const b = getBounds();
    if (!b || !imgNatural) return null;
    return {
      x: Math.max(0, Math.min(imgNatural.w, (sx - b.offsetX) / b.scale)),
      y: Math.max(0, Math.min(imgNatural.h, (sy - b.offsetY) / b.scale)),
    };
  }

  function onDown(clientX: number, clientY: number) {
    const c = containerRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    dragStartRef.current = { x: clientX - rect.left, y: clientY - rect.top };
    setSelection(null);
    onAreaChangeRef.current(null);
  }

  function onMove(clientX: number, clientY: number) {
    if (!dragStartRef.current) return;
    const c = containerRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    setSelection({
      x1: dragStartRef.current.x,
      y1: dragStartRef.current.y,
      x2: clientX - rect.left,
      y2: clientY - rect.top,
    });
  }

  function onUp(clientX: number, clientY: number) {
    if (!dragStartRef.current) return;
    const c = containerRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    const start = toImageCoords(dragStartRef.current.x, dragStartRef.current.y);
    const end = toImageCoords(clientX - rect.left, clientY - rect.top);
    dragStartRef.current = null;
    if (!start || !end) return;
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    if (width < 10 || height < 10) {
      setSelection(null);
      onAreaChangeRef.current(null);
      return;
    }
    onAreaChangeRef.current({ x, y, width, height });
  }

  const selRect = selection
    ? {
        left: Math.min(selection.x1, selection.x2),
        top: Math.min(selection.y1, selection.y2),
        width: Math.abs(selection.x2 - selection.x1),
        height: Math.abs(selection.y2 - selection.y1),
      }
    : null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden select-none cursor-crosshair"
      style={{ touchAction: "none" }}
      onMouseDown={(e) => onDown(e.clientX, e.clientY)}
      onMouseMove={(e) => { if (dragStartRef.current) onMove(e.clientX, e.clientY); }}
      onMouseUp={(e) => onUp(e.clientX, e.clientY)}
      onTouchStart={(e) => { e.preventDefault(); const t = e.touches[0]; if (t) onDown(t.clientX, t.clientY); }}
      onTouchMove={(e) => { e.preventDefault(); const t = e.touches[0]; if (t) onMove(t.clientX, t.clientY); }}
      onTouchEnd={(e) => { e.preventDefault(); const t = e.changedTouches[0]; if (t) onUp(t.clientX, t.clientY); }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        onLoad={(e) => {
          const img = e.currentTarget;
          setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
        }}
      />
      {selRect && (
        <div
          className="absolute border-2 border-white pointer-events-none"
          style={{
            left: selRect.left,
            top: selRect.top,
            width: selRect.width,
            height: selRect.height,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
          }}
        />
      )}
      {imgNatural && !selRect && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white/70 text-sm bg-black/50 px-3 py-1.5 rounded-full">
            드래그하여 영역 선택
          </span>
        </div>
      )}
    </div>
  );
}

export default function ImageEditModal({ imageSrc, onConfirm, onCancel }: Props) {
  const [crop, setCrop]               = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom]               = useState(1);
  const [rotation, setRotation]       = useState(0);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [processing, setProcessing]   = useState(false);
  const [aspect, setAspect]           = useState<number | undefined>(undefined);
  const [drawnArea, setDrawnArea]     = useState<Area | null>(null);

  const isFree = aspect === undefined;
  const controlsH = isFree ? 148 : 244;

  const onCancelRef = useRef(onCancel);
  useEffect(() => { onCancelRef.current = onCancel; });

  useEffect(() => {
    history.pushState({ imageEdit: true }, "");
    const onPop = () => {
      history.pushState({ imageEdit: true }, "");
      onCancelRef.current();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  async function handleConfirm() {
    if (isFree && !drawnArea) return;
    if (!isFree && !croppedArea) return;
    setProcessing(true);
    try {
      const blob = isFree
        ? await getCroppedBlob(imageSrc, drawnArea!, 0)
        : await getCroppedBlob(imageSrc, croppedArea!, rotation);
      onConfirm(blob);
    } finally {
      setProcessing(false);
    }
  }

  function handleAspectChange(value: number | undefined) {
    setAspect(value);
    if (value !== undefined) {
      setDrawnArea(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    }
  }

  const canConfirm = isFree ? !!drawnArea : !!croppedArea;

  return (
    <div className="fixed inset-0 bg-black" style={{ zIndex: 9999 }}>
      {/* 크로퍼 */}
      <div className="absolute inset-x-0 top-0" style={{ bottom: controlsH }}>
        {isFree ? (
          <FreeDrawCrop imageSrc={imageSrc} onAreaChange={setDrawnArea} />
        ) : (
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
            }}
          />
        )}
      </div>

      {/* 컨트롤 */}
      <div
        className="absolute inset-x-0 bottom-0 bg-neutral-900 px-5 pt-4 flex flex-col gap-3"
        style={{ height: controlsH, paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        {/* 비율 */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {RATIOS.map(({ label, value }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleAspectChange(value)}
              className={`shrink-0 px-3 h-7 rounded-full text-xs font-medium border transition-colors ${
                aspect === value
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "border-slate-600 text-slate-300 hover:border-slate-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 회전/줌 — 자유 모드에서 숨김 */}
        {!isFree && (
          <>
            <div className="flex items-center gap-3">
              <span className="text-white text-xs w-8 shrink-0">회전</span>
              <input
                type="range" min={-180} max={180} value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="flex-1 accent-indigo-400"
              />
              <span className="text-white text-xs w-10 text-right">{rotation}°</span>
              <button type="button" onClick={() => setRotation(0)}
                className="text-xs text-slate-400 hover:text-white shrink-0">
                초기화
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white text-xs w-8 shrink-0">줌</span>
              <input
                type="range" min={1} max={3} step={0.05} value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-indigo-400"
              />
              <span className="text-white text-xs w-10 text-right">{zoom.toFixed(1)}×</span>
            </div>
          </>
        )}

        {/* 버튼 */}
        <div className="flex gap-2">
          <button type="button" onClick={onCancel}
            className="flex-1 h-10 rounded-xl bg-slate-700 text-white text-sm font-medium">
            취소
          </button>
          <button type="button" onClick={() => onConfirm(new Blob())}
            className="h-10 px-3 rounded-xl bg-slate-600 text-slate-300 text-xs font-medium">
            편집 없이
          </button>
          <button type="button" onClick={handleConfirm} disabled={processing || !canConfirm}
            className="flex-1 h-10 rounded-xl bg-indigo-600 text-white text-sm font-bold disabled:opacity-50">
            {processing ? "처리 중..." : "적용"}
          </button>
        </div>
      </div>
    </div>
  );
}
