import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import { createInitialDomainState, type DomainState } from "./domainState";
import {
  createInitialHistoryState,
  historyReducer,
  type HistoryAction,
  type HistoryState,
} from "./historyReducer";
import type { DomainAction } from "./domainActions";
import { loadDomainState, saveDomainState } from "./sessionPersistence";

const DomainStateContext = createContext<DomainState | undefined>(undefined);
const DomainDispatchContext = createContext<Dispatch<DomainAction> | undefined>(
  undefined,
);
const HistoryMetaContext = createContext<
  { canUndo: boolean; canRedo: boolean; dispatch: Dispatch<HistoryAction> } | undefined
>(undefined);

function createInitialState(): HistoryState {
  const restored = loadDomainState();
  return createInitialHistoryState(restored ?? createInitialDomainState());
}

export function DomainStateProvider({ children }: { children: ReactNode }) {
  const [history, dispatch] = useReducer(historyReducer, undefined, createInitialState);

  useEffect(() => {
    saveDomainState(history.present);
  }, [history.present]);

  return (
    <DomainStateContext.Provider value={history.present}>
      <DomainDispatchContext.Provider value={dispatch}>
        <HistoryMetaContext.Provider
          value={{
            canUndo: history.past.length > 0,
            canRedo: history.future.length > 0,
            dispatch,
          }}
        >
          {children}
        </HistoryMetaContext.Provider>
      </DomainDispatchContext.Provider>
    </DomainStateContext.Provider>
  );
}

export function useDomainState(): DomainState {
  const state = useContext(DomainStateContext);
  if (!state) throw new Error("DomainStateProvider の外では使えません");
  return state;
}

export function useDomainDispatch(): Dispatch<DomainAction> {
  const dispatch = useContext(DomainDispatchContext);
  if (!dispatch) throw new Error("DomainStateProvider の外では使えません");
  return dispatch;
}

export function useUndoRedo(): {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
} {
  const meta = useContext(HistoryMetaContext);
  if (!meta) throw new Error("DomainStateProvider の外では使えません");
  return {
    undo: () => meta.dispatch({ type: "UNDO" }),
    redo: () => meta.dispatch({ type: "REDO" }),
    canUndo: meta.canUndo,
    canRedo: meta.canRedo,
  };
}

// JSONファイルからの読み込みで、domain state全体を置き換える
// (Undo/Redo履歴もリセットされる)。
export function useLoadDomainState(): (state: DomainState) => void {
  const meta = useContext(HistoryMetaContext);
  if (!meta) throw new Error("DomainStateProvider の外では使えません");
  return (state: DomainState) => meta.dispatch({ type: "LOAD_STATE", state });
}
