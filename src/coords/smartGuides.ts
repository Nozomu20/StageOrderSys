import type { Stage } from "../domain/stage";
import type { PlacementsById } from "../domain/placement";
import type { MemberId } from "../domain/ids";
import { computeTierRanges } from "../domain/tierLayout";

export interface GuideCandidates {
  xs: number[];
  ys: number[];
}

// スマートガイドの候補: 中心線(x=0)・各段(segment)の左右端と前後端・
// 他の団員コマの座標。ドラッグ中のコマ自身は候補から除外する。
export function computeGuideCandidates(
  stage: Stage,
  placements: PlacementsById,
  excludeMemberId: MemberId | null,
): GuideCandidates {
  const xs = new Set<number>([0]);
  const ys = new Set<number>();

  for (const { tier, yStart_mm } of computeTierRanges(stage.tiers)) {
    for (const seg of tier.segments) {
      xs.add(seg.offsetX_mm - seg.width_mm / 2);
      xs.add(seg.offsetX_mm + seg.width_mm / 2);
      ys.add(yStart_mm + seg.offsetY_mm);
      ys.add(yStart_mm + seg.offsetY_mm + seg.depth_mm);
    }
  }

  for (const placement of Object.values(placements)) {
    if (placement.memberId === excludeMemberId) continue;
    xs.add(placement.x_mm);
    ys.add(placement.y_mm);
  }

  return { xs: [...xs], ys: [...ys] };
}

function findNearest(
  value: number,
  candidates: number[],
  threshold_mm: number,
): number | null {
  let best: number | null = null;
  let bestDist = threshold_mm;
  for (const candidate of candidates) {
    const dist = Math.abs(value - candidate);
    if (dist <= bestDist) {
      bestDist = dist;
      best = candidate;
    }
  }
  return best;
}

export interface SnapResult {
  x_mm: number;
  y_mm: number;
  activeGuideX: number | null;
  activeGuideY: number | null;
}

// 軸ごとに、スマートガイド候補とグリッド吸着のうち生の値に近い方を採用する。
// グリッド吸着は間隔さえ指定されれば必ず候補を持つため、スマートガイドは
// しきい値内にある場合のみ候補として扱う(＝両者は独立に動作し、近い方が勝つ)。
export function applySnapping(
  raw: { x_mm: number; y_mm: number },
  candidates: GuideCandidates,
  guideThreshold_mm: number,
  gridIntervalMm: number | null,
): SnapResult {
  const guideX = findNearest(raw.x_mm, candidates.xs, guideThreshold_mm);
  const guideY = findNearest(raw.y_mm, candidates.ys, guideThreshold_mm);
  const gridX =
    gridIntervalMm != null
      ? Math.round(raw.x_mm / gridIntervalMm) * gridIntervalMm
      : null;
  const gridY =
    gridIntervalMm != null
      ? Math.round(raw.y_mm / gridIntervalMm) * gridIntervalMm
      : null;

  function pick(
    rawValue: number,
    guide: number | null,
    grid: number | null,
  ): { value: number; usedGuide: boolean } {
    if (guide === null && grid === null) return { value: rawValue, usedGuide: false };
    if (guide === null) return { value: grid as number, usedGuide: false };
    if (grid === null) return { value: guide, usedGuide: true };
    const usesGuide = Math.abs(rawValue - guide) <= Math.abs(rawValue - grid);
    return usesGuide ? { value: guide, usedGuide: true } : { value: grid, usedGuide: false };
  }

  const x = pick(raw.x_mm, guideX, gridX);
  const y = pick(raw.y_mm, guideY, gridY);

  return {
    x_mm: x.value,
    y_mm: y.value,
    activeGuideX: x.usedGuide ? guideX : null,
    activeGuideY: y.usedGuide ? guideY : null,
  };
}
