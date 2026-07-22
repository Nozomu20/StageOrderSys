import type { Tier } from "../../domain/stage";
import { computeTierRanges } from "../../domain/tierLayout";
import { MmText } from "./MmText";

interface TierShapesProps {
  tiers: Tier[];
}

export function TierShapes({ tiers }: TierShapesProps) {
  const ranges = computeTierRanges(tiers);
  return (
    <>
      {ranges.map(({ tier, yStart_mm }) =>
        tier.segments.map((seg) => (
          <rect
            key={seg.id}
            x={seg.offsetX_mm - seg.width_mm / 2}
            y={yStart_mm + seg.offsetY_mm}
            width={seg.width_mm}
            height={seg.depth_mm}
            fill={tier.order % 2 === 0 ? "#e0e0e0" : "#ececec"}
            stroke="#999"
            strokeWidth={5}
          />
        )),
      )}
      {ranges.map(({ tier, yStart_mm }) => (
        <MmText
          key={`label-${tier.id}`}
          x_mm={0}
          y_mm={yStart_mm + 60}
          fontSize_mm={80}
        >
          {`${tier.order + 1}段目`}
        </MmText>
      ))}
    </>
  );
}
