import { useState } from "react";
import { useDomainDispatch, useDomainState } from "../../state/DomainStateContext";
import { parseBulkNames } from "../../domain/nameParsing";
import type { PartId } from "../../domain/ids";

export function BulkPasteForm() {
  const state = useDomainState();
  const dispatch = useDomainDispatch();
  const [text, setText] = useState("");
  const [partId, setPartId] = useState<PartId | "">(
    state.roster.parts[0]?.id ?? "",
  );

  return (
    <div>
      <h3>団員の一括登録</h3>
      <p className="screen-hint" style={{ margin: "0 0 8px" }}>
        1行1名で入力してください。姓と名はスペースで区切ります(区切りがなければ姓のみとして扱います)。
      </p>
      <textarea
        rows={6}
        style={{ width: "100%", marginBottom: 8 }}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="field-row" style={{ marginBottom: 0 }}>
        <select
          value={partId}
          onChange={(e) => setPartId(e.target.value as PartId)}
        >
          {state.roster.parts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          disabled={!partId || !text.trim()}
          onClick={() => {
            if (!partId) return;
            const names = parseBulkNames(text);
            if (names.length === 0) return;
            dispatch({ type: "ADD_MEMBERS_BULK", names, partId });
            setText("");
          }}
        >
          登録
        </button>
      </div>
    </div>
  );
}
