import { mm, type Millimeter } from "./units";
import { createId, type PropId, type SegmentId, type TierId } from "./ids";
import { BOARD_CATALOG, createSegmentsFromBoard } from "./boardCatalog";

const DEFAULT_PROP_LABEL: Record<PropType, string> = {
  conductor: "指揮",
  piano: "ピアノ",
};

// 追加直後に重ならないよう、種類ごとに初期位置を少しずらす。
// 床(客席寄り、y<0)の中に収まる位置を初期値とする。
const DEFAULT_PROP_POSITION_MM: Record<PropType, { x_mm: number; y_mm: number }> = {
  conductor: { x_mm: 0, y_mm: -300 },
  piano: { x_mm: 900, y_mm: -500 },
};

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

// 床(段以外のステージスペース全て)は段の配列に含めない。
// tiers は実際に組む段(雛壇)だけを表し、order=0 が最前列の段になる。
export interface Tier {
  id: TierId;
  order: number; // 0 = 最前列の段。奥へ向かって1,2,3...
  height_mm: Millimeter; // 床からのこの段の高さ
  mode: TierMode;
  segments: Segment[]; // simpleでも必ず1要素以上(板1枚=1segment)
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

export function createNextTier(existingTiers: Tier[]): Tier {
  const order =
    existingTiers.length === 0
      ? 0
      : Math.max(...existingTiers.map((t) => t.order)) + 1;
  // 初期値として幅6尺奥行3尺の板を1枚だけ置いておく。UIから変更する前提。
  const defaultBoard = BOARD_CATALOG[0];
  return {
    id: createId<"Tier">(),
    order,
    height_mm: mm(303),
    mode: "simple",
    segments: createSegmentsFromBoard(defaultBoard, 1),
  };
}

export function createProp(type: PropType): Prop {
  const position = DEFAULT_PROP_POSITION_MM[type];
  return {
    id: createId<"Prop">(),
    type,
    x_mm: mm(position.x_mm),
    y_mm: mm(position.y_mm),
    angle_deg: 0,
    label: DEFAULT_PROP_LABEL[type],
  };
}

export function createDefaultStage(): Stage {
  return {
    name: "",
    tiers: [],
    props: [],
  };
}
