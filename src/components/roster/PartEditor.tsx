import { useState } from "react";
import { useDomainDispatch, useDomainState } from "../../state/DomainStateContext";
import { nextPartColor } from "../../domain/partColors";
import { ColorSwatchPicker } from "./ColorSwatchPicker";

export function PartEditor() {
  const state = useDomainState();
  const dispatch = useDomainDispatch();
  const [newPartName, setNewPartName] = useState("");

  return (
    <div>
      <h3>パート</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {[...state.roster.parts]
          .sort((a, b) => a.order - b.order)
          .map((part) => (
            <li
              key={part.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
                flexWrap: "wrap",
              }}
            >
              <ColorSwatchPicker
                value={part.color}
                onChange={(color) =>
                  dispatch({
                    type: "UPDATE_PART",
                    partId: part.id,
                    patch: { color },
                  })
                }
              />
              <input
                type="text"
                value={part.name}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_PART",
                    partId: part.id,
                    patch: { name: e.target.value },
                  })
                }
                style={{ width: 140 }}
              />
              <button
                className="btn-small btn-danger"
                onClick={() =>
                  dispatch({ type: "REMOVE_PART", partId: part.id })
                }
              >
                削除
              </button>
            </li>
          ))}
      </ul>
      <div className="field-row" style={{ marginBottom: 0 }}>
        <input
          type="text"
          placeholder="新しいパート名"
          value={newPartName}
          onChange={(e) => setNewPartName(e.target.value)}
          style={{ width: 160 }}
        />
        <button
          onClick={() => {
            if (!newPartName.trim()) return;
            dispatch({
              type: "ADD_PART",
              name: newPartName.trim(),
              color: nextPartColor(state.roster.parts.length),
            });
            setNewPartName("");
          }}
        >
          + パートを追加
        </button>
      </div>
    </div>
  );
}
