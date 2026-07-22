import { mm, type Millimeter } from "./units";
import { createId, type PropId, type SegmentId, type TierId } from "./ids";

// 平台の標準規格 (6尺 x 3尺)
export const DEFAULT_SEGMENT_WIDTH_MM = mm(1818);
export const DEFAULT_SEGMENT_DEPTH_MM = mm(909);

export interface Segment {
  id: SegmentId;
  width_mm: Millimeter;
  depth_mm: Millimeter;
  // 段の中心(＝ステージ中心のX)を基準としたオフセット。
  // simpleモードでは常に0固定。
  offsetX_mm: Millimeter;
  offsetY_mm: Millimeter;
  // このセグメント自身の位置を軸とした回転角。simpleモードでは常に0。
  angle_deg: number;
}

export type TierMode = "simple" | "advanced";

export interface Tier {
  id: TierId;
  order: number; // 0 = 床(最前)。奥へ向かって1,2,3...
  height_mm: Millimeter; // 床(order=0)は常に0固定
  mode: TierMode;
  segments: Segment[]; // simpleでも必ず1要素以上
}

export type PropType = "conductor" | "piano";

export interface Prop {
  id: PropId;
  type: PropType;
  x_mm: Millimeter;
  y_mm: Millimeter;
  angle_deg: number;
  label?: string;
}

export interface Stage {
  name: string;
  tiers: Tier[];
  props: Prop[];
  stageWidth_mm?: Millimeter;
  stageDepth_mm?: Millimeter;
}

export function createDefaultSegment(
  width_mm: Millimeter = DEFAULT_SEGMENT_WIDTH_MM,
  depth_mm: Millimeter = DEFAULT_SEGMENT_DEPTH_MM,
): Segment {
  return {
    id: createId<"Segment">(),
    width_mm,
    depth_mm,
    offsetX_mm: mm(0),
    offsetY_mm: mm(0),
    angle_deg: 0,
  };
}

export function createFloorTier(): Tier {
  return {
    id: createId<"Tier">(),
    order: 0,
    height_mm: mm(0),
    mode: "simple",
    segments: [createDefaultSegment()],
  };
}

export function createNextTier(existingTiers: Tier[]): Tier {
  const order =
    existingTiers.length === 0
      ? 0
      : Math.max(...existingTiers.map((t) => t.order)) + 1;
  return {
    id: createId<"Tier">(),
    order,
    // 床以外のデフォルト高さは要件定義の未決事項(段の高さプリセット)に依存するため
    // 暫定値として1尺(303mm)を置く。UIから変更する前提。
    height_mm: order === 0 ? mm(0) : mm(303),
    mode: "simple",
    segments: [createDefaultSegment()],
  };
}

export function createDefaultStage(): Stage {
  return {
    name: "",
    tiers: [createFloorTier()],
    props: [],
  };
}
