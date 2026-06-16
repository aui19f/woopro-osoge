"use client";

import { FormGeometry, switchGeometries } from "../../../types/forms";
import { cn } from "../../../utils/cn";

interface SwitchProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  sizing?: FormGeometry;
  label?: string;
}

export default function Switch({
  checked,
  onChange,
  sizing = "md",
  label,
}: SwitchProps) {
  const styles = switchGeometries[sizing];

  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={cn(
          "relative flex items-center rounded-full transition-colors duration-200",
          styles.track,
          checked ? "bg-point" : "bg-slate-300"
        )}
      >
        <div
          className={cn(
            "bg-white rounded-full shadow-md transition-transform duration-200",
            styles.thumb,
            checked ? styles.active : "translate-x-1"
          )}
        />
      </div>
      {label && <span className="text-slate-600 font-medium">{label}</span>}
    </label>
  );
}
