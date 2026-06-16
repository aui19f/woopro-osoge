export const formPalettes = {
  // 메인 포인트 컬러 (Deep Navy 계열)
  primary: "bg-point border-point text-white",
  "primary-line": "border border-point text-point",

  // 세컨더리 컬러 (Orange 계열)
  secondary: "bg-secondary border-secondary text-white",
  "secondary-line": "border border-secondary text-secondary",

  // 엑센트 컬러 (Light Green 계열)
  accent: "bg-accent border-accent text-white", // 글자색은 가독성을 위해 point 권장
  "accent-line": "border border-accent text-accent",

  // 공통 다크/비활성화 스타일
  dark: "bg-slate-600 border-slate-600 text-white",
  "dark-line": "border border-slate-600 text-slate-600",
  disabled:
    "bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed opacity-60",
} as const;

// 2. 공통 기하학적 수치(크기) 정의
// Input, Select, Button용 (높이 및 패딩 기반)
export const formGeometries = {
  sm: "h-9 py-1 px-2 text-sm rounded-md", // h-auto보다는 구체적인 높이(h-9 등)가 정렬 시 유리합니다.
  md: "h-12 py-2 px-4 rounded-lg",
  lg: "h-14 py-3 px-6 text-lg font-bold rounded-xl",
} as const;

// Checkbox, Radio용 (정사각형 기반)
export const selectionGeometries = {
  sm: {
    box: "w-4 h-4",
    indicator: "w-2.5 h-2.5",
    text: "text-sm",
    gap: "gap-2",
  },
  md: {
    box: "w-6 h-6",
    indicator: "w-4 h-4",
    text: "text-base",
    gap: "gap-3",
  },
  lg: {
    box: "w-8 h-8",
    indicator: "w-5 h-5",
    text: "text-lg",
    gap: "gap-4",
  },
} as const;

// types/forms.ts 에 추가하거나 참고하게
export const imageGeometries = {
  sm: {
    box: "w-16 h-16",
    icon: "w-4 h-4",
    removeBtn: "w-5 h-5",
    textSize: "text-[9px]",
  },
  md: {
    box: "w-24 h-24",
    icon: "w-6 h-6",
    removeBtn: "w-6 h-6",
    textSize: "text-[10px]",
  },
  lg: {
    box: "w-32 h-32",
    icon: "w-8 h-8",
    removeBtn: "w-7 h-7",
    textSize: "text-xs",
  },
} as const;

export const switchGeometries = {
  sm: {
    track: "w-8 h-4",
    thumb: "w-3 h-3",
    active: "translate-x-4",
    gap: "gap-2",
  },
  md: {
    track: "w-10 h-6",
    thumb: "w-4 h-4",
    active: "translate-x-5",
    gap: "gap-3",
  },
  lg: {
    track: "w-14 h-8",
    thumb: "w-6 h-6",
    active: "translate-x-7",
    gap: "gap-4",
  },
} as const;

// 3. 타입 추출
export type FormPalette = keyof typeof formPalettes;
export type FormGeometry = keyof typeof formGeometries;
export type SelectionGeometry = keyof typeof selectionGeometries;

export interface FormOption {
  id: string;
  label: string;
}
