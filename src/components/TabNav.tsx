import { useUIState } from "../state/UIStateContext";
import type { ScreenTab } from "../state/uiState";

const TABS: { tab: ScreenTab; label: string }[] = [
  { tab: "stageSettings", label: "ステージ設定" },
  { tab: "roster", label: "団員登録" },
  { tab: "placementEditor", label: "配置エディタ" },
  { tab: "output", label: "出力" },
];

export function TabNav() {
  const { uiState, setUIState } = useUIState();
  return (
    <nav style={{ display: "flex", gap: 8, borderBottom: "1px solid #ccc", padding: 8 }}>
      {TABS.map(({ tab, label }) => (
        <button
          key={tab}
          onClick={() => setUIState({ activeTab: tab })}
          style={{
            fontWeight: uiState.activeTab === tab ? "bold" : "normal",
          }}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
