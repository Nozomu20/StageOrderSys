import { mm, type Millimeter } from "./units";
import { createId } from "./ids";
import type { Segment } from "./stage";

// 会場ごとに規格が異なる山台(平台)の参考カタログ。1段=1種類の板を何枚か並べる、という前提。
// 在庫枚数・価格はソフトの関心事ではないため持たない。
export interface BoardSpec {
  id: string;
  width_mm: Millimeter;
  depth_mm: Millimeter;
  label: string;
}

export const BOARD_CATALOG: BoardSpec[] = [
  { id: "w6-d3", width_mm: mm(1818), depth_mm: mm(909), label: "幅6尺 奥行3尺" },
  { id: "w5-d3", width_mm: mm(1515), depth_mm: mm(909), label: "幅5尺 奥行3尺" },
  { id: "w4-d3", width_mm: mm(1212), depth_mm: mm(909), label: "幅4尺 奥行3尺" },
  { id: "w3-d3", width_mm: mm(909), depth_mm: mm(909), label: "幅3尺 奥行3尺" },
  { id: "w6-d6", width_mm: mm(1818), depth_mm: mm(1818), label: "幅6尺 奥行6尺" },
];

export interface BoardSize {
  width_mm: Millimeter;
  depth_mm: Millimeter;
}

// 選んだ板(幅×奥行)をcount枚、段の中心を基準に横並びのsegmentsにする。
export function createSegmentsFromBoard(
  board: BoardSize,
  count: number,
): Segment[] {
  const totalWidth = board.width_mm * count;
  let cursor = -totalWidth / 2;
  const segments: Segment[] = [];
  for (let i = 0; i < count; i++) {
    const offsetX_mm = mm(cursor + board.width_mm / 2);
    segments.push({
      id: createId<"Segment">(),
      width_mm: board.width_mm,
      depth_mm: board.depth_mm,
      offsetX_mm,
      offsetY_mm: mm(0),
      angle_deg: 0,
    });
    cursor += board.width_mm;
  }
  return segments;
}
