import { createContext, useContext, useState, type ReactNode } from "react";
import { initialUIState, type UIState } from "./uiState";

interface UIStateContextValue {
  uiState: UIState;
  setUIState: (patch: Partial<UIState>) => void;
}

const UIStateContext = createContext<UIStateContextValue | undefined>(
  undefined,
);

export function UIStateProvider({ children }: { children: ReactNode }) {
  const [uiState, setUIStateRaw] = useState<UIState>(initialUIState);
  const setUIState = (patch: Partial<UIState>) =>
    setUIStateRaw((prev) => ({ ...prev, ...patch }));
  return (
    <UIStateContext.Provider value={{ uiState, setUIState }}>
      {children}
    </UIStateContext.Provider>
  );
}

export function useUIState(): UIStateContextValue {
  const value = useContext(UIStateContext);
  if (!value) throw new Error("UIStateProvider の外では使えません");
  return value;
}
