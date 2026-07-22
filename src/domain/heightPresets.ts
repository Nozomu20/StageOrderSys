import { mm, type Millimeter } from "./units";

// 段の高さのプリセット(要件定義4.2)。実際の箱馬・開き足の規格に応じて要調整。
export interface HeightPreset {
  height_mm: Millimeter;
  label: string;
}

export const HEIGHT_PRESETS: HeightPreset[] = [
  { height_mm: mm(151.5), label: "5寸" },
  { height_mm: mm(212.1), label: "7寸" },
  { height_mm: mm(303), label: "1尺" },
  { height_mm: mm(454.5), label: "1尺5寸" },
  { height_mm: mm(606), label: "2尺" },
];
