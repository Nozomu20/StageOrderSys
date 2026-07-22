import type { DomainState } from "./domainState";

// 保存機能そのものは持たない方針(要件定義5.2)。誤ってリロード・タブを
// 閉じた際に作業が消えないよう、直近の状態をsessionStorageにだけ退避する。
// UIには表に出さない。
const STORAGE_KEY = "stageOrderSys.autosave.v1";

export function saveDomainState(state: DomainState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 容量超過などで保存できなくても致命的ではないため無視する。
  }
}

export function loadDomainState(): DomainState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DomainState;
  } catch {
    return null;
  }
}
