import { useEffect, useState } from "react";
import type { Tier } from "../../domain/stage";
import { mm, mmToShakuSun, shakuSunToMm } from "../../domain/units";
import { BOARD_CATALOG } from "../../domain/boardCatalog";
import { HEIGHT_PRESETS } from "../../domain/heightPresets";
import { useDomainDispatch } from "../../state/DomainStateContext";

interface TierCardProps {
  tier: Tier;
  index: number;
  isFirst: boolean;
  isLast: boolean;
}

const CUSTOM_BOARD_ID = "custom";
const CUSTOM_HEIGHT_CHOICE = "custom";
// 1尺=303mmなので、この程度の誤差ならプリセット一致とみなす。
const HEIGHT_MATCH_EPSILON_MM = 0.01;

function findMatchingBoardId(tier: Tier): string {
  const seg = tier.segments[0];
  if (!seg) return BOARD_CATALOG[0].id;
  const match = BOARD_CATALOG.find(
    (b) => b.width_mm === seg.width_mm && b.depth_mm === seg.depth_mm,
  );
  return match?.id ?? CUSTOM_BOARD_ID;
}

function findMatchingHeightChoice(height_mm: number): string {
  const match = HEIGHT_PRESETS.find(
    (p) => Math.abs(p.height_mm - height_mm) < HEIGHT_MATCH_EPSILON_MM,
  );
  return match ? String(match.height_mm) : CUSTOM_HEIGHT_CHOICE;
}

// 段=1種類の板を何枚か横に並べたもの、という入力モデル。
// プルダウンの変更は即時、枚数・自由入力欄は入力を離れたタイミングで
// 反映する(キー入力のたびにdispatchして履歴が荒れるのを避けるため)。
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

  const [heightChoice, setHeightChoice] = useState(
    findMatchingHeightChoice(tier.height_mm),
  );
  const [heightUnit, setHeightUnit] = useState<"mm" | "shakusun">("mm");
  const initialShakuSun = mmToShakuSun(tier.height_mm);
  const [customHeightMm, setCustomHeightMm] = useState(String(tier.height_mm));
  const [customShaku, setCustomShaku] = useState(
    String(initialShakuSun.shaku),
  );
  const [customSun, setCustomSun] = useState(
    initialShakuSun.sun.toFixed(1),
  );

  // 全段一括設定など、このカード以外からheight_mmが変わった場合に表示を同期する。
  useEffect(() => {
    setHeightChoice(findMatchingHeightChoice(tier.height_mm));
    const shakuSun = mmToShakuSun(tier.height_mm);
    setCustomHeightMm(String(tier.height_mm));
    setCustomShaku(String(shakuSun.shaku));
    setCustomSun(shakuSun.sun.toFixed(1));
  }, [tier.height_mm]);

  // 引数で明示的に値を受け取る(stateの更新が反映される前に呼ばれても
  // 古い値を参照しないようにするため)。
  function applyBoard(
    nextBoardId: string,
    nextCount: string,
    nextCustomWidth: string,
    nextCustomDepth: string,
  ) {
    const resolvedCount = Number(nextCount);
    if (!Number.isFinite(resolvedCount) || resolvedCount <= 0) return;

    const board = BOARD_CATALOG.find((b) => b.id === nextBoardId);
    const width_mm = board ? board.width_mm : Number(nextCustomWidth);
    const depth_mm = board ? board.depth_mm : Number(nextCustomDepth);
    if (!Number.isFinite(width_mm) || width_mm <= 0) return;
    if (!Number.isFinite(depth_mm) || depth_mm <= 0) return;

    dispatch({
      type: "SET_TIER_BOARD",
      tierId: tier.id,
      board: { width_mm: mm(width_mm), depth_mm: mm(depth_mm) },
      count: resolvedCount,
    });
  }

  function selectHeightChoice(choice: string) {
    setHeightChoice(choice);
    if (choice !== CUSTOM_HEIGHT_CHOICE) {
      dispatch({
        type: "SET_TIER_HEIGHT",
        tierId: tier.id,
        height_mm: mm(Number(choice)),
      });
    }
  }

  function applyCustomHeight(
    unit: "mm" | "shakusun",
    nextMm: string,
    nextShaku: string,
    nextSun: string,
  ) {
    const height_mm =
      unit === "mm"
        ? Number(nextMm)
        : shakuSunToMm(Number(nextShaku) || 0, Number(nextSun) || 0);
    if (!Number.isFinite(height_mm) || height_mm < 0) return;
    dispatch({
      type: "SET_TIER_HEIGHT",
      tierId: tier.id,
      height_mm: mm(height_mm),
    });
  }

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <strong style={{ fontSize: 16 }}>{index + 1}段目</strong>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            className="btn-small"
            disabled={isFirst}
            onClick={() =>
              dispatch({ type: "MOVE_TIER", tierId: tier.id, direction: "up" })
            }
            title="手前に移動"
          >
            ↑
          </button>
          <button
            className="btn-small"
            disabled={isLast}
            onClick={() =>
              dispatch({ type: "MOVE_TIER", tierId: tier.id, direction: "down" })
            }
            title="奥に移動"
          >
            ↓
          </button>
          <button
            className="btn-small btn-danger"
            onClick={() => dispatch({ type: "REMOVE_TIER", tierId: tier.id })}
          >
            削除
          </button>
        </div>
      </div>

      <div className="field-row">
        <span className="field-label">段の板</span>
        <select
          value={boardId}
          onChange={(e) => {
            setBoardId(e.target.value);
            applyBoard(e.target.value, count, customWidth, customDepth);
          }}
        >
          {BOARD_CATALOG.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
          <option value={CUSTOM_BOARD_ID}>その他(自由入力)</option>
        </select>
        {boardId === CUSTOM_BOARD_ID && (
          <>
            <span>幅</span>
            <input
              type="number"
              value={customWidth}
              onChange={(e) => setCustomWidth(e.target.value)}
              onBlur={() =>
                applyBoard(boardId, count, customWidth, customDepth)
              }
              style={{ width: 70 }}
            />
            <span>mm × 奥行</span>
            <input
              type="number"
              value={customDepth}
              onChange={(e) => setCustomDepth(e.target.value)}
              onBlur={() =>
                applyBoard(boardId, count, customWidth, customDepth)
              }
              style={{ width: 70 }}
            />
            <span>mm</span>
          </>
        )}
      </div>

      <div className="field-row">
        <span className="field-label">枚数</span>
        <input
          type="number"
          min={1}
          value={count}
          onChange={(e) => setCount(e.target.value)}
          onBlur={() => applyBoard(boardId, count, customWidth, customDepth)}
          style={{ width: 60 }}
        />
        <span>枚</span>
      </div>

      <div className="field-row" style={{ marginBottom: 0 }}>
        <span className="field-label">高さ(床から)</span>
        <select
          value={heightChoice}
          onChange={(e) => selectHeightChoice(e.target.value)}
        >
          {HEIGHT_PRESETS.map((p) => (
            <option key={p.label} value={String(p.height_mm)}>
              {p.label}({p.height_mm}mm)
            </option>
          ))}
          <option value={CUSTOM_HEIGHT_CHOICE}>その他(自由入力)</option>
        </select>
        {heightChoice === CUSTOM_HEIGHT_CHOICE && (
          <>
            <select
              value={heightUnit}
              onChange={(e) =>
                setHeightUnit(e.target.value as "mm" | "shakusun")
              }
            >
              <option value="mm">mm</option>
              <option value="shakusun">尺・寸</option>
            </select>
            {heightUnit === "mm" ? (
              <input
                type="number"
                value={customHeightMm}
                onChange={(e) => setCustomHeightMm(e.target.value)}
                onBlur={() =>
                  applyCustomHeight("mm", customHeightMm, customShaku, customSun)
                }
                style={{ width: 90 }}
              />
            ) : (
              <>
                <input
                  type="number"
                  value={customShaku}
                  onChange={(e) => setCustomShaku(e.target.value)}
                  onBlur={() =>
                    applyCustomHeight(
                      "shakusun",
                      customHeightMm,
                      customShaku,
                      customSun,
                    )
                  }
                  style={{ width: 50 }}
                />
                <span>尺</span>
                <input
                  type="number"
                  value={customSun}
                  onChange={(e) => setCustomSun(e.target.value)}
                  onBlur={() =>
                    applyCustomHeight(
                      "shakusun",
                      customHeightMm,
                      customShaku,
                      customSun,
                    )
                  }
                  style={{ width: 50 }}
                />
                <span>寸</span>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
