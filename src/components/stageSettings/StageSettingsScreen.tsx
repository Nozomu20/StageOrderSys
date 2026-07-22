import { useDomainDispatch, useDomainState } from "../../state/DomainStateContext";
import { TierCard } from "./TierCard";
import { AllTierHeightForm } from "./AllTierHeightForm";

export function StageSettingsScreen() {
  const state = useDomainState();
  const dispatch = useDomainDispatch();
  const sortedTiers = [...state.stage.tiers].sort((a, b) => a.order - b.order);

  return (
    <div className="screen">
      <h2>ステージ設定</h2>
      <p className="screen-hint">
        床(段以外のステージスペース)は自動的に描画されるため、ここでの設定は不要です。
      </p>
      {sortedTiers.length > 0 && <AllTierHeightForm />}
      {sortedTiers.map((tier, i) => (
        <TierCard
          key={tier.id}
          tier={tier}
          index={i}
          isFirst={i === 0}
          isLast={i === sortedTiers.length - 1}
        />
      ))}
      <button className="btn-primary" onClick={() => dispatch({ type: "ADD_TIER" })}>
        + 段を追加
      </button>
    </div>
  );
}
