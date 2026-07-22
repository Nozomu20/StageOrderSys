import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import type { Stage } from "../../domain/stage";
import { mm } from "../../domain/units";
import type { Member, Part } from "../../domain/roster";
import type { MemberId, PropId } from "../../domain/ids";
import type { PlacementsById } from "../../domain/placement";
import type { Settings } from "../../state/settings";
import {
  computeStageBounds,
  computeViewBox,
  expandBoundsWithPoints,
} from "../../coords/viewBox";
import { TierShapes } from "./TierShapes";
import { ChipLayer, type ChipEntry } from "./ChipLayer";
import { PropsLayer } from "./PropsLayer";
import { AudienceSideLabel } from "./AudienceSideLabel";

// 床(段以外のステージスペース)の描画量。実測値ではなく見た目上の目安。
// ピアノを初期位置(y=-500mm)に置いたときに奥行き方向(約1085mm)が
// はみ出さない程度の余裕を持たせている。
const FLOOR_DEPTH_MM = 1800;
// 段が1つもない場合でも床が見える最小幅。
const FLOOR_FALLBACK_WIDTH_MM = 1818;
const AUDIENCE_LABEL_Y_MM = -FLOOR_DEPTH_MM / 2;

interface StageSvgCanvasProps {
  svgRef: RefObject<SVGSVGElement | null>;
  groupRef: RefObject<SVGGElement | null>;
  stage: Stage;
  placements: PlacementsById;
  members: Member[];
  parts: Part[];
  displayNames: Map<MemberId, string>;
  settings: Settings;
  draggingMemberId: MemberId | null;
  dragPreviewMm: { x_mm: number; y_mm: number } | null;
  onChipPointerDown: (memberId: MemberId, e: ReactPointerEvent) => void;
  draggingPropId: PropId | null;
  selectedPropId: PropId | null;
  onPropPointerDown: (propId: PropId, e: ReactPointerEvent) => void;
  onPropClick: (propId: PropId) => void;
}

export function StageSvgCanvas({
  svgRef,
  groupRef,
  stage,
  placements,
  members,
  parts,
  displayNames,
  settings,
  draggingMemberId,
  dragPreviewMm,
  onChipPointerDown,
  draggingPropId,
  selectedPropId,
  onPropPointerDown,
  onPropClick,
}: StageSvgCanvasProps) {
  const colorByPartId = new Map(parts.map((p) => [p.id, p.color]));

  const chips: ChipEntry[] = members
    .filter((m) => m.isPresent)
    .flatMap((m) => {
      const isDragging = draggingMemberId === m.id;
      const position = isDragging ? dragPreviewMm : placements[m.id] ?? null;
      if (!position) return [];
      return [
        {
          memberId: m.id,
          x_mm: position.x_mm,
          y_mm: position.y_mm,
          color: colorByPartId.get(m.partId) ?? "#999999",
          label: displayNames.get(m.id) ?? m.familyName,
          isPreview: isDragging,
        },
      ];
    });

  const props = stage.props.map((p) => {
    const isDragging = draggingPropId === p.id;
    const position = isDragging && dragPreviewMm ? dragPreviewMm : p;
    return { ...p, x_mm: mm(position.x_mm), y_mm: mm(position.y_mm) };
  });

  const baseBounds = computeStageBounds(stage.tiers);
  const floorWidth_mm = Math.max(
    baseBounds.maxX_mm - baseBounds.minX_mm,
    FLOOR_FALLBACK_WIDTH_MM,
  );
  const floorMinX_mm =
    stage.tiers.length > 0 ? baseBounds.minX_mm : -floorWidth_mm / 2;
  const floorMaxX_mm =
    stage.tiers.length > 0 ? baseBounds.maxX_mm : floorWidth_mm / 2;

  const boundsWithFloor = expandBoundsWithPoints(
    baseBounds,
    [
      { x_mm: floorMinX_mm, y_mm: -FLOOR_DEPTH_MM },
      { x_mm: floorMaxX_mm, y_mm: -FLOOR_DEPTH_MM },
    ],
    0,
  );
  // 表示範囲(viewBox)は、確定済みの位置(placements/stage.props)だけから計算する。
  // ドラッグ中の一時的な座標(dragPreviewMm)を含めると、ドラッグするたびに
  // 表示範囲が広がったり縮んだりして、床や段ごと動いて見えてしまうため。
  const boundsWithChips = expandBoundsWithPoints(
    boundsWithFloor,
    Object.values(placements).map((p) => ({ x_mm: p.x_mm, y_mm: p.y_mm })),
    settings.chipDiameterMm / 2 + 50,
  );
  const boundsWithProps = expandBoundsWithPoints(
    boundsWithChips,
    stage.props.map((p) => ({ x_mm: p.x_mm, y_mm: p.y_mm })),
    1800,
  );
  const viewBox = computeViewBox(boundsWithProps, 200);

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      style={{ width: "100%", height: "100%", background: "#fff", touchAction: "none" }}
    >
      <g ref={groupRef} transform="scale(1, -1)">
        <rect
          x={floorMinX_mm}
          y={-FLOOR_DEPTH_MM}
          width={floorMaxX_mm - floorMinX_mm}
          height={FLOOR_DEPTH_MM}
          fill="#f7f7f7"
          stroke="#ccc"
          strokeWidth={5}
        />
        <TierShapes tiers={stage.tiers} />
        <PropsLayer
          props={props}
          chipDiameter_mm={settings.chipDiameterMm}
          fontSize_mm={settings.fontSizeMm}
          selectedPropId={selectedPropId}
          onPropPointerDown={onPropPointerDown}
          onPropClick={onPropClick}
        />
        <ChipLayer
          chips={chips}
          chipDiameter_mm={settings.chipDiameterMm}
          fontSize_mm={settings.fontSizeMm}
          onChipPointerDown={onChipPointerDown}
        />
        <AudienceSideLabel y_mm={AUDIENCE_LABEL_Y_MM} />
      </g>
    </svg>
  );
}
