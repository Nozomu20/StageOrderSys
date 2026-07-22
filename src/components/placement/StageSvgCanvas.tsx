import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import type { Stage } from "../../domain/stage";
import type { Member, Part } from "../../domain/roster";
import type { MemberId } from "../../domain/ids";
import type { PlacementsById } from "../../domain/placement";
import type { Settings } from "../../state/settings";
import {
  computeStageBounds,
  computeViewBox,
  expandBoundsWithPoints,
} from "../../coords/viewBox";
import { TierShapes } from "./TierShapes";
import { ChipLayer, type ChipEntry } from "./ChipLayer";
import { AudienceSideLabel } from "./AudienceSideLabel";

const AUDIENCE_LABEL_Y_MM = -400;

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

  const baseBounds = computeStageBounds(stage.tiers);
  const boundsWithChips = expandBoundsWithPoints(
    baseBounds,
    chips.map((c) => ({ x_mm: c.x_mm, y_mm: c.y_mm })),
    settings.chipDiameterMm / 2 + 50,
  );
  const boundsWithAudience = expandBoundsWithPoints(
    boundsWithChips,
    [{ x_mm: 0, y_mm: AUDIENCE_LABEL_Y_MM }],
    100,
  );
  const viewBox = computeViewBox(boundsWithAudience, 200);

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      style={{ width: "100%", height: "100%", background: "#fff", touchAction: "none" }}
    >
      <g ref={groupRef} transform="scale(1, -1)">
        <TierShapes tiers={stage.tiers} />
        <ChipLayer
          chips={chips}
          chipDiameter_mm={settings.chipDiameterMm}
          fontSize_mm={settings.fontSizeMm}
          onChipPointerDown={onChipPointerDown}
        />
        <AudienceSideLabel y_mm={AUDIENCE_LABEL_Y_MM + 150} />
      </g>
    </svg>
  );
}
