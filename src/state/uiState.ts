export type ScreenTab = "stageSettings" | "roster" | "placementEditor";

// Undo/Redoの対象にしないUIだけの状態。domain stateとは別枠で管理する。
export interface UIState {
  activeTab: ScreenTab;
  selectedMemberId: string | null;
}

export const initialUIState: UIState = {
  activeTab: "stageSettings",
  selectedMemberId: null,
};
