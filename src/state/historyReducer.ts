import type { DomainState } from "./domainState";
import type { DomainAction } from "./domainActions";
import { domainReducer } from "./domainReducer";

// domainReducerを履歴管理でラップする。domainReducer自体は
// 変更しない(純粋関数のまま)。1dispatch=1履歴エントリになる。
export interface HistoryState {
  past: DomainState[];
  present: DomainState;
  future: DomainState[];
}

export type UndoRedoAction = { type: "UNDO" } | { type: "REDO" };
export type HistoryAction = DomainAction | UndoRedoAction;

// 際限なく積み上げないための上限。
const MAX_HISTORY_LENGTH = 100;

export function createInitialHistoryState(present: DomainState): HistoryState {
  return { past: [], present, future: [] };
}

export function historyReducer(
  state: HistoryState,
  action: HistoryAction,
): HistoryState {
  if (action.type === "UNDO") {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    return {
      past: state.past.slice(0, -1),
      present: previous,
      future: [state.present, ...state.future],
    };
  }

  if (action.type === "REDO") {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    return {
      past: [...state.past, state.present],
      present: next,
      future: state.future.slice(1),
    };
  }

  const nextPresent = domainReducer(state.present, action);
  if (nextPresent === state.present) return state;
  const past = [...state.past, state.present].slice(-MAX_HISTORY_LENGTH);
  return { past, present: nextPresent, future: [] };
}
