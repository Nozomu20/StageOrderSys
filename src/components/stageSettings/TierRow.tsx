import { useState } from "react";
import type { Tier } from "../../domain/stage";
import { mm } from "../../domain/units";
import { useDomainDispatch } from "../../state/DomainStateContext";

interface TierRowProps {
  tier: Tier;
  isFirst: boolean;
  isLast: boolean;
}

// 入力中の値はローカルで保持し、blur時にまとめてdispatchする。
// (1キー入力ごとに履歴が積まれるのを避けるため。将来Undo/Redoを入れる前提の設計)
export function TierRow({ tier, isFirst, isLast }: TierRowProps) {
  const dispatch = useDomainDispatch();
  const segment = tier.segments[0];
  const [width, setWidth] = useState(String(segment.width_mm));
  const [depth, setDepth] = useState(String(segment.depth_mm));
  const [height, setHeight] = useState(String(tier.height_mm));

  function commitSize() {
    const width_mm = Number(width);
    const depth_mm = Number(depth);
    if (Number.isFinite(width_mm) && Number.isFinite(depth_mm)) {
      dispatch({
        type: "SET_TIER_SIMPLE_SIZE",
        tierId: tier.id,
        width_mm: mm(width_mm),
        depth_mm: mm(depth_mm),
      });
    }
  }

  function commitHeight() {
    const height_mm = Number(height);
    if (Number.isFinite(height_mm)) {
      dispatch({ type: "SET_TIER_HEIGHT", tierId: tier.id, height_mm: mm(height_mm) });
    }
  }

  return (
    <tr>
      <td>{tier.order === 0 ? "床" : `${tier.order}段目`}</td>
      <td>
        <input
          type="number"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          onBlur={commitSize}
          style={{ width: 90 }}
        />{" "}
        mm
      </td>
      <td>
        <input
          type="number"
          value={depth}
          onChange={(e) => setDepth(e.target.value)}
          onBlur={commitSize}
          style={{ width: 90 }}
        />{" "}
        mm
      </td>
      <td>
        {tier.order === 0 ? (
          "0 (床)"
        ) : (
          <>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              onBlur={commitHeight}
              style={{ width: 90 }}
            />{" "}
            mm
          </>
        )}
      </td>
      <td>
        <button
          disabled={isFirst}
          onClick={() =>
            dispatch({ type: "MOVE_TIER", tierId: tier.id, direction: "up" })
          }
        >
          ↑
        </button>
        <button
          disabled={isLast}
          onClick={() =>
            dispatch({ type: "MOVE_TIER", tierId: tier.id, direction: "down" })
          }
        >
          ↓
        </button>
        <button
          disabled={tier.order === 0}
          onClick={() => dispatch({ type: "REMOVE_TIER", tierId: tier.id })}
        >
          削除
        </button>
      </td>
    </tr>
  );
}
