import { useState } from "react";
import { useDomainDispatch, useDomainState } from "../../state/DomainStateContext";

const DEFAULT_NEW_PART_COLOR = "#64b5f6";

export function PartEditor() {
  const state = useDomainState();
  const dispatch = useDomainDispatch();
  const [newPartName, setNewPartName] = useState("");

  return (
    <div>
      <h3>パート</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {[...state.roster.parts]
          .sort((a, b) => a.order - b.order)
          .map((part) => (
            <li key={part.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="color"
                value={part.color}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_PART",
                    partId: part.id,
                    patch: { color: e.target.value },
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
              />
              <button
                onClick={() =>
                  dispatch({ type: "REMOVE_PART", partId: part.id })
                }
              >
                削除
              </button>
            </li>
          ))}
      </ul>
      <input
        type="text"
        placeholder="新しいパート名"
        value={newPartName}
        onChange={(e) => setNewPartName(e.target.value)}
      />
      <button
        onClick={() => {
          if (!newPartName.trim()) return;
          dispatch({
            type: "ADD_PART",
            name: newPartName.trim(),
            color: DEFAULT_NEW_PART_COLOR,
          });
          setNewPartName("");
        }}
      >
        パートを追加
      </button>
    </div>
  );
}
