import { useState } from "react";
import type { Tier } from "../../domain/stage";
import { mm } from "../../domain/units";
import { BOARD_CATALOG } from "../../domain/boardCatalog";
import { useDomainDispatch } from "../../state/DomainStateContext";

interface TierCardProps {
  tier: Tier;
  index: number;
  isFirst: boolean;
  isLast: boolean;
}

const CUSTOM_BOARD_ID = "custom";

function findMatchingBoardId(tier: Tier): string {
  const seg = tier.segments[0];
  if (!seg) return BOARD_CATALOG[0].id;
  const match = BOARD_CATALOG.find(
    (b) => b.width_mm === seg.width_mm && b.depth_mm === seg.depth_mm,
  );
  return match?.id ?? CUSTOM_BOARD_ID;
}

// 段=1種類の板を何枚か横に並べたもの、という入力モデル。
// プルダウンで板を選び、枚数を入力して「反映」でまとめてdispatchする
// (将来Undo/Redoを入れたときの履歴単位を1操作にするため)。
export function TierCard({ tier, index, isFirst, isLast }: TierCardProps) {
  const dispatch = useDomainDispatch();
  const seg = tier.segments[0];

  const [boardId, setBoardId] = useState<string>(findMatchingBoardId(tier));
  const [customWidth, setCustomWidth] = useState(
    String(seg?.width_mm ?? BOARD_CATALOG[0].width_mm),
  );
  const [customDepth, setCustomDepth] = useState(
    String(seg?.depth_mm ?? BOARD_CATALOG[0].depth_mm),
  );
  const [count, setCount] = useState(String(tier.segments.length || 1));
  const [height, setHeight] = useState(String(tier.height_mm));

  const selectedBoard = BOARD_CATALOG.find((b) => b.id === boardId);

  function applyBoard() {
    const resolvedCount = Number(count);
    if (!Number.isFinite(resolvedCount) || resolvedCount <= 0) return;

    const width_mm = selectedBoard ? selectedBoard.width_mm : Number(customWidth);
    const depth_mm = selectedBoard ? selectedBoard.depth_mm : Number(customDepth);
    if (!Number.isFinite(width_mm) || width_mm <= 0) return;
    if (!Number.isFinite(depth_mm) || depth_mm <= 0) return;

    dispatch({
      type: "SET_TIER_BOARD",
      tierId: tier.id,
      board: { width_mm: mm(width_mm), depth_mm: mm(depth_mm) },
      count: resolvedCount,
    });
  }

  function commitHeight() {
    const height_mm = Number(height);
    if (Number.isFinite(height_mm)) {
      dispatch({
        type: "SET_TIER_HEIGHT",
        tierId: tier.id,
        height_mm: mm(height_mm),
      });
    }
  }

  return (
    <div style={{ border: "1px solid #ccc", padding: 12, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>{index + 1}段目</strong>
        <div>
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
          <button onClick={() => dispatch({ type: "REMOVE_TIER", tierId: tier.id })}>
            削除
          </button>
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        段の板:{" "}
        <select value={boardId} onChange={(e) => setBoardId(e.target.value)}>
          {BOARD_CATALOG.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
          <option value={CUSTOM_BOARD_ID}>その他(自由入力)</option>
        </select>
        {boardId === CUSTOM_BOARD_ID && (
          <span style={{ marginLeft: 8 }}>
            幅
            <input
              type="number"
              value={customWidth}
              onChange={(e) => setCustomWidth(e.target.value)}
              style={{ width: 70, marginLeft: 4 }}
            />
            mm × 奥行
            <input
              type="number"
              value={customDepth}
              onChange={(e) => setCustomDepth(e.target.value)}
              style={{ width: 70, marginLeft: 4 }}
            />
            mm
          </span>
        )}
      </div>

      <div style={{ marginTop: 8 }}>
        枚数:{" "}
        <input
          type="number"
          min={1}
          value={count}
          onChange={(e) => setCount(e.target.value)}
          style={{ width: 60 }}
        />
        枚
        <button onClick={applyBoard} style={{ marginLeft: 8 }}>
          反映
        </button>
      </div>

      <div style={{ marginTop: 8 }}>
        この段の高さ(床からの高さ):{" "}
        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          onBlur={commitHeight}
          style={{ width: 90 }}
        />{" "}
        mm
      </div>
    </div>
  );
}
