export type ScreenTab =
  | "stageSettings"
  | "roster"
  | "placementEditor"
  | "output"
  | "settings";

// Undo/Redoの対象にしないUIだけの状態。domain stateとは別枠で管理する。
export interface UIState {
  activeTab: ScreenTab;
}

export const initialUIState: UIState = {
  activeTab: "stageSettings",
};
