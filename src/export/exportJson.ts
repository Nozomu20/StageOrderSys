import type { DomainState } from "../state/domainState";
import {
  encodeObscured,
  FILE_EXTENSION,
  SCHEMA_VERSION,
  type SavedFile,
} from "../state/savedFile";

export function buildSavedFileText(state: DomainState): string {
  const payload: SavedFile = {
    schemaVersion: SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    state,
  };
  return encodeObscured(JSON.stringify(payload));
}

export function downloadSavedFile(state: DomainState, baseName: string): void {
  const text = buildSavedFileText(state);
  const blob = new Blob([text], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${baseName}.${FILE_EXTENSION}`;
  a.click();
  URL.revokeObjectURL(url);
}
