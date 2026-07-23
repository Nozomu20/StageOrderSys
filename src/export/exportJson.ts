import type { DomainState } from "../state/domainState";
import { SCHEMA_VERSION, type SavedFile } from "../state/savedFile";

export function buildSavedFileJson(state: DomainState): string {
  const payload: SavedFile = {
    schemaVersion: SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    state,
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadJson(state: DomainState, filename: string): void {
  const json = buildSavedFileJson(state);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
