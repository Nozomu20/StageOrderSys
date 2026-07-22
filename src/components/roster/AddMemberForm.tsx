import { useState } from "react";
import { useDomainDispatch, useDomainState } from "../../state/DomainStateContext";
import type { PartId } from "../../domain/ids";

export function AddMemberForm() {
  const state = useDomainState();
  const dispatch = useDomainDispatch();
  const [familyName, setFamilyName] = useState("");
  const [givenName, setGivenName] = useState("");
  const [partId, setPartId] = useState<PartId | "">(
    state.roster.parts[0]?.id ?? "",
  );

  function handleAdd() {
    if (!familyName.trim() || !partId) return;
    dispatch({
      type: "ADD_MEMBER",
      familyName: familyName.trim(),
      givenName: givenName.trim() || undefined,
      partId,
    });
    setFamilyName("");
    setGivenName("");
  }

  return (
    <div>
      <h3>団員を1人ずつ追加</h3>
      <input
        type="text"
        placeholder="姓"
        value={familyName}
        onChange={(e) => setFamilyName(e.target.value)}
        style={{ width: 100 }}
      />
      <input
        type="text"
        placeholder="名(任意)"
        value={givenName}
        onChange={(e) => setGivenName(e.target.value)}
        style={{ width: 100, marginLeft: 4 }}
      />
      <select
        value={partId}
        onChange={(e) => setPartId(e.target.value as PartId)}
        style={{ marginLeft: 4 }}
      >
        {state.roster.parts.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <button
        onClick={handleAdd}
        disabled={!familyName.trim() || !partId}
        style={{ marginLeft: 4 }}
      >
        追加
      </button>
    </div>
  );
}
