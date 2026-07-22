import type { Tier } from "../domain/stage";
import { computeTierRanges } from "../domain/tierLayout";

export interface Bounds {
  minX_mm: number;
  maxX_mm: number;
  minY_mm: number;
  maxY_mm: number;
}

export function computeStageBounds(tiers: Tier[]): Bounds {
  const ranges = computeTierRanges(tiers);
  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;
  for (const { tier, yStart_mm, yEnd_mm } of ranges) {
    for (const seg of tier.segments) {
      const halfWidth = seg.width_mm / 2;
      minX = Math.min(minX, seg.offsetX_mm - halfWidth);
      maxX = Math.max(maxX, seg.offsetX_mm + halfWidth);
    }
    minY = Math.min(minY, yStart_mm);
    maxY = Math.max(maxY, yEnd_mm);
  }
  return { minX_mm: minX, maxX_mm: maxX, minY_mm: minY, maxY_mm: maxY };
}

// 配置済みコマなど、段の範囲外に置かれた点も表示範囲に含める。
export function expandBoundsWithPoints(
  bounds: Bounds,
  points: { x_mm: number; y_mm: number }[],
  margin_mm: number,
): Bounds {
  let { minX_mm, maxX_mm, minY_mm, maxY_mm } = bounds;
  for (const p of points) {
    minX_mm = Math.min(minX_mm, p.x_mm - margin_mm);
    maxX_mm = Math.max(maxX_mm, p.x_mm + margin_mm);
    minY_mm = Math.min(minY_mm, p.y_mm - margin_mm);
    maxY_mm = Math.max(maxY_mm, p.y_mm + margin_mm);
  }
  return { minX_mm, maxX_mm, minY_mm, maxY_mm };
}

// SVGルートに渡すviewBox文字列を作る。
// 内側の<g transform="scale(1,-1)">で奥(Y+)を画面の上に見せる前提のため、
// Y方向はドメイン座標の符号を反転させた範囲にする。
export function computeViewBox(bounds: Bounds, padding_mm: number): string {
  const minX = bounds.minX_mm - padding_mm;
  const maxX = bounds.maxX_mm + padding_mm;
  const minY = bounds.minY_mm - padding_mm;
  const maxY = bounds.maxY_mm + padding_mm;
  const width = maxX - minX;
  const height = maxY - minY;
  return `${minX} ${-maxY} ${width} ${height}`;
}
