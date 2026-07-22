// パートを識別する色は自由入力にせず、この固定パレットから選ぶ。
// 隣接色のCVD(色覚多様性)分離を検証済みの配色(dataviz skillのreferences/palette.md)。
export const PART_COLOR_PALETTE: string[] = [
  "#2a78d6", // blue
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
  "#e87ba4", // magenta
  "#eb6834", // orange
];

export function nextPartColor(existingPartCount: number): string {
  return PART_COLOR_PALETTE[existingPartCount % PART_COLOR_PALETTE.length];
}
