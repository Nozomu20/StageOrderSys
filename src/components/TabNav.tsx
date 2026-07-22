import { useUIState } from "../state/UIStateContext";
import type { ScreenTab } from "../state/uiState";
import { UndoRedoControls } from "./UndoRedoControls";

const TABS: { tab: ScreenTab; label: string }[] = [
  { tab: "stageSettings", label: "ステージ設定" },
  { tab: "roster", label: "団員登録" },
  { tab: "placementEditor", label: "配置エディタ" },
  { tab: "output", label: "出力" },
  { tab: "settings", label: "設定" },
];

export function TabNav() {
  const { uiState, setUIState } = useUIState();
  return (
    <nav className="tab-nav">
      <div className="tab-nav-tabs">
        {TABS.map(({ tab, label }) => (
          <button
            key={tab}
            className={
              "tab-button" + (uiState.activeTab === tab ? " is-active" : "")
            }
            onClick={() => setUIState({ activeTab: tab })}
          >
            {label}
          </button>
        ))}
      </div>
      <UndoRedoControls />
    </nav>
  );
}
