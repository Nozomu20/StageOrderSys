import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";
import { createInitialDomainState, type DomainState } from "./domainState";
import { domainReducer } from "./domainReducer";
import type { DomainAction } from "./domainActions";

const DomainStateContext = createContext<DomainState | undefined>(undefined);
const DomainDispatchContext = createContext<Dispatch<DomainAction> | undefined>(
  undefined,
);

export function DomainStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(domainReducer, undefined, createInitialDomainState);
  return (
    <DomainStateContext.Provider value={state}>
      <DomainDispatchContext.Provider value={dispatch}>
        {children}
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
