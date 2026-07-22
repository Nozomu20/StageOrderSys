import { useMemo } from "react";
import { useDomainDispatch, useDomainState } from "../../state/DomainStateContext";
import { resolveDisplayNames } from "../../domain/displayName";
import type { PartId } from "../../domain/ids";

export function MemberTable() {
  const state = useDomainState();
  const dispatch = useDomainDispatch();
  const displayNames = useMemo(
    () => resolveDisplayNames(state.roster.members),
    [state.roster.members],
  );

  return (
    <div>
      <h3>名簿</h3>
      <table>
        <thead>
          <tr>
            <th>姓</th>
            <th>名</th>
            <th>パート</th>
            <th>出欠</th>
            <th>表示名(自動解決)</th>
            <th>表示名を手動固定</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {state.roster.members.map((m) => (
            <tr key={m.id}>
              <td>{m.familyName}</td>
              <td>{m.givenName ?? ""}</td>
              <td>
                <select
                  value={m.partId}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_MEMBER",
                      memberId: m.id,
                      patch: { partId: e.target.value as PartId },
                    })
                  }
                >
                  {state.roster.parts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={m.isPresent}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_MEMBER",
                      memberId: m.id,
                      patch: { isPresent: e.target.checked },
                    })
                  }
                />
              </td>
              <td>{displayNames.get(m.id) ?? m.familyName}</td>
              <td>
                <input
                  type="text"
                  placeholder="(自動)"
                  defaultValue={m.displayNameOverride ?? ""}
                  onBlur={(e) =>
                    dispatch({
                      type: "UPDATE_MEMBER",
                      memberId: m.id,
                      patch: {
                        displayNameOverride: e.target.value.trim() || undefined,
                      },
                    })
                  }
                />
              </td>
              <td>
                <button
                  onClick={() =>
                    dispatch({ type: "REMOVE_MEMBER", memberId: m.id })
                  }
                >
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
