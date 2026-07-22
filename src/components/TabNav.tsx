import { useUIState } from "../state/UIStateContext";
import type { ScreenTab } from "../state/uiState";
import { UndoRedoControls } from "./UndoRedoControls";

// 「この順に進める」という流れを見せるステップ群。設定はいつでも
// 変更してよい補助的な項目なので、流れの外に分離して表示する。
const FLOW_TABS: { tab: ScreenTab; label: string }[] = [
  { tab: "stageSettings", label: "ステージ設定" },
  { tab: "roster", label: "団員登録" },
  { tab: "placementEditor", label: "配置エディタ" },
  { tab: "output", label: "出力" },
];

export function TabNav() {
  const { uiState, setUIState } = useUIState();
  return (
    <nav className="tab-nav">
      <ol className="step-flow">
        {FLOW_TABS.map(({ tab, label }, index) => (
          <li className="step-flow-item" key={tab}>
            <button
              className={
                "step-item" + (uiState.activeTab === tab ? " is-active" : "")
              }
              onClick={() => setUIState({ activeTab: tab })}
            >
              <span className="step-number">{index + 1}</span>
              <span className="step-label">{label}</span>
            </button>
            {index < FLOW_TABS.length - 1 && (
              <span className="step-connector" aria-hidden="true">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
      <div className="tab-nav-aux">
        <button
          className={
            "tab-button" + (uiState.activeTab === "settings" ? " is-active" : "")
          }
          onClick={() => setUIState({ activeTab: "settings" })}
        >
          設定
        </button>
        <UndoRedoControls />
      </div>
    </nav>
  );
}
