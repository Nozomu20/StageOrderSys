// 内部データはすべてmm単位。pxや尺寸との取り違えを防ぐためbranded typeにする。
export type Millimeter = number & { readonly __unit: "mm" };

export function mm(value: number): Millimeter {
  return value as Millimeter;
}
