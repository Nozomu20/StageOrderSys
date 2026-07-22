import { useDomainDispatch, useDomainState } from "../../state/DomainStateContext";
import { TierRow } from "./TierRow";

export function StageSettingsScreen() {
  const state = useDomainState();
  const dispatch = useDomainDispatch();
  const sortedTiers = [...state.stage.tiers].sort((a, b) => a.order - b.order);

  return (
    <div style={{ padding: 16 }}>
      <h2>ステージ設定</h2>
      <table>
        <thead>
          <tr>
            <th>段</th>
            <th>幅</th>
            <th>奥行</th>
            <th>高さ(床からの累積ではなく、この段の高さ)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sortedTiers.map((tier, i) => (
            <TierRow
              key={tier.id}
              tier={tier}
              isFirst={i === 0}
              isLast={i === sortedTiers.length - 1}
            />
          ))}
        </tbody>
      </table>
      <button onClick={() => dispatch({ type: "ADD_TIER" })}>段を追加</button>
    </div>
  );
}
