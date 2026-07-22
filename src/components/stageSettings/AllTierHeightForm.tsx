import { useState } from "react";
import { mm } from "../../domain/units";
import { HEIGHT_PRESETS } from "../../domain/heightPresets";
import { useDomainDispatch } from "../../state/DomainStateContext";

export function AllTierHeightForm() {
  const dispatch = useDomainDispatch();
  const [heightChoice, setHeightChoice] = useState(
    String(HEIGHT_PRESETS[0].height_mm),
  );

  return (
    <div className="card field-row" style={{ marginBottom: 16 }}>
      <span className="field-label">全段を同じ高さに設定</span>
      <select
        value={heightChoice}
        onChange={(e) => setHeightChoice(e.target.value)}
      >
        {HEIGHT_PRESETS.map((p) => (
          <option key={p.label} value={String(p.height_mm)}>
            {p.label}({p.height_mm}mm)
          </option>
        ))}
      </select>
      <button
        className="btn-small"
        onClick={() =>
          dispatch({
            type: "SET_ALL_TIER_HEIGHTS",
            height_mm: mm(Number(heightChoice)),
          })
        }
      >
        全段に適用
      </button>
    </div>
  );
}
