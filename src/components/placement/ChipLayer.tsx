import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import type { MemberId } from "../../domain/ids";
import { MmText } from "./MmText";

export interface ChipEntry {
  memberId: MemberId;
  x_mm: number;
  y_mm: number;
  color: string;
  label: string;
  isPreview: boolean;
  isSelected: boolean;
  hasOverlap: boolean;
}

interface ChipLayerProps {
  chips: ChipEntry[];
  chipDiameter_mm: number;
  fontSize_mm: number;
  onChipPointerDown: (memberId: MemberId, e: ReactPointerEvent) => void;
  onChipClick: (memberId: MemberId, e: ReactMouseEvent) => void;
}

export function ChipLayer({
  chips,
  chipDiameter_mm,
  fontSize_mm,
  onChipPointerDown,
  onChipClick,
}: ChipLayerProps) {
  const radius = chipDiameter_mm / 2;
  return (
    <>
      {chips.map((chip) => (
        <g key={chip.memberId} opacity={chip.isPreview ? 0.6 : 1}>
          {chip.hasOverlap && (
            <circle
              cx={chip.x_mm}
              cy={chip.y_mm}
              r={radius + 20}
              fill="none"
              stroke="#e34948"
              strokeWidth={8}
              strokeDasharray="16 10"
            />
          )}
          <circle
            cx={chip.x_mm}
            cy={chip.y_mm}
            r={radius}
            fill={chip.color}
            stroke={chip.isSelected ? "#0d9488" : "#333"}
            strokeWidth={chip.isSelected ? 10 : 4}
            style={{ cursor: "grab", touchAction: "none" }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onChipPointerDown(chip.memberId, e);
            }}
            onClick={(e) => {
              e.stopPropagation();
              onChipClick(chip.memberId, e);
            }}
          />
          <MmText
            x_mm={chip.x_mm}
            y_mm={chip.y_mm}
            fontSize_mm={fontSize_mm}
          >
            {chip.label}
          </MmText>
        </g>
      ))}
    </>
  );
}
