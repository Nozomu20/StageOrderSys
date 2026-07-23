import { DomainStateProvider } from "../state/DomainStateContext";
import { UIStateProvider, useUIState } from "../state/UIStateContext";
import { TabNav } from "./TabNav";
import { AppFooter } from "./AppFooter";
import { WelcomeModal } from "./WelcomeModal";
import { StageSettingsScreen } from "./stageSettings/StageSettingsScreen";
import { RosterScreen } from "./roster/RosterScreen";
import { PlacementEditorScreen } from "./placement/PlacementEditorScreen";
import { OutputScreen } from "./output/OutputScreen";
import { SettingsScreen } from "./settings/SettingsScreen";

function Screens() {
  const { uiState } = useUIState();
  switch (uiState.activeTab) {
    case "stageSettings":
      return <StageSettingsScreen />;
    case "roster":
      return <RosterScreen />;
    case "placementEditor":
      return <PlacementEditorScreen />;
    case "output":
      return <OutputScreen />;
    case "settings":
      return <SettingsScreen />;
  }
}

function ScreensArea() {
  const { uiState } = useUIState();
  const isFullBleed = uiState.activeTab === "placementEditor";
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflow: isFullBleed ? "hidden" : "auto",
      }}
    >
      <Screens />
    </div>
  );
}

export function App() {
  return (
    <DomainStateProvider>
      <UIStateProvider>
        <div className="app-shell">
          <TabNav />
          <ScreensArea />
          <AppFooter />
          <WelcomeModal />
        </div>
      </UIStateProvider>
    </DomainStateProvider>
  );
}
