import { DomainStateProvider } from "../state/DomainStateContext";
import { UIStateProvider, useUIState } from "../state/UIStateContext";
import { TabNav } from "./TabNav";
import { StageSettingsScreen } from "./stageSettings/StageSettingsScreen";
import { RosterScreen } from "./roster/RosterScreen";
import { PlacementEditorScreen } from "./placement/PlacementEditorScreen";

function Screens() {
  const { uiState } = useUIState();
  switch (uiState.activeTab) {
    case "stageSettings":
      return <StageSettingsScreen />;
    case "roster":
      return <RosterScreen />;
    case "placementEditor":
      return <PlacementEditorScreen />;
  }
}

export function App() {
  return (
    <DomainStateProvider>
      <UIStateProvider>
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
          <TabNav />
          <div style={{ flex: 1, minHeight: 0 }}>
            <Screens />
          </div>
        </div>
      </UIStateProvider>
    </DomainStateProvider>
  );
}
