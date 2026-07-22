// 内部データはすべてmm単位。pxや尺寸との取り違えを防ぐためbranded typeにする。
export type Millimeter = number & { readonly __unit: "mm" };

export function mm(value: number): Millimeter {
  return value as Millimeter;
}

// 尺貫法の換算(要件定義2章: 1尺=303mm、1寸=30.3mm)。表示・入力時のみ使う。
export const MM_PER_SHAKU = 303;
export const MM_PER_SUN = 30.3;

export function shakuSunToMm(shaku: number, sun: number): Millimeter {
  return mm(shaku * MM_PER_SHAKU + sun * MM_PER_SUN);
}

export function mmToShakuSun(value: number): { shaku: number; sun: number } {
  const shaku = Math.floor(value / MM_PER_SHAKU);
  const sun = (value - shaku * MM_PER_SHAKU) / MM_PER_SUN;
  return { shaku, sun };
}
