import type { DomainState } from "../state/domainState";
import { SCHEMA_VERSION } from "../state/savedFile";

const REQUIRED_STATE_KEYS = [
  "stage",
  "roster",
  "placements",
  "settings",
  "outputInfo",
] as const;

// このツールで書き出したJSONかどうかを最低限チェックする。
// (フィールドの中身まで厳密に検証はしないが、明らかに違うファイルや
// 将来のバージョンで保存されたファイルを弾く)
export function parseSavedFileJson(text: string): DomainState {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(
      "JSONとして読み込めませんでした。ファイルが壊れているか、対応していない形式です。",
    );
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("このツールで保存したファイルではないようです。");
  }
  const file = parsed as Record<string, unknown>;

  if (typeof file.schemaVersion !== "number") {
    throw new Error("このツールで保存したファイルではないようです。");
  }
  if (file.schemaVersion > SCHEMA_VERSION) {
    throw new Error(
      "新しいバージョンのツールで保存されたファイルのため、読み込めません。",
    );
  }

  if (typeof file.state !== "object" || file.state === null) {
    throw new Error("保存データの中身が見つかりませんでした。");
  }
  const state = file.state as Record<string, unknown>;
  const missingKey = REQUIRED_STATE_KEYS.find((key) => !(key in state));
  if (missingKey) {
    throw new Error("保存データの内容が不完全なようです。");
  }

  return file.state as DomainState;
}
