import { mm, type Millimeter } from "./units";
import type { Tier } from "./stage";

export interface TierRange {
  tier: Tier;
  yStart_mm: Millimeter;
  yEnd_mm: Millimeter;
}

// 段の奥行き方向の位置は、要件定義に明示ルールがないため
// 「前の段の奥行きの累積で自動配置する」という方針で確定させたもの。
// tier(order=0)の前端はステージ原点(y=0)、以降は前の段の奥端を基準線とする。
export function computeTierRanges(tiers: Tier[]): TierRange[] {
  const sorted = [...tiers].sort((a, b) => a.order - b.order);
  const ranges: TierRange[] = [];
  let cursor_mm = 0;
  for (const tier of sorted) {
    const depth_mm = Math.max(...tier.segments.map((s) => s.depth_mm), 0);
    const yStart_mm = mm(cursor_mm);
    const yEnd_mm = mm(cursor_mm + depth_mm);
    ranges.push({ tier, yStart_mm, yEnd_mm });
    cursor_mm += depth_mm;
  }
  return ranges;
}

// Placementのy座標から、その人がどの段に立っているかを逆算する。
// 段の奥行き範囲からはみ出す配置(未決事項)は、現時点では許容し、
// 最も近い段にフォールバックする。
export function findTierAt(y_mm: number, tiers: Tier[]): Tier | undefined {
  const ranges = computeTierRanges(tiers);
  const hit = ranges.find((r) => y_mm >= r.yStart_mm && y_mm < r.yEnd_mm);
  if (hit) return hit.tier;
  if (ranges.length === 0) return undefined;
  return y_mm < ranges[0].yStart_mm
    ? ranges[0].tier
    : ranges[ranges.length - 1].tier;
}
