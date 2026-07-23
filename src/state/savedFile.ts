import type { DomainState } from "./domainState";

// セッションを超えて続きから作業できるようにするための、独自のJSON保存形式。
// (要件定義5.3のCOULD「JSONのエクスポート/インポート」に相当。ユーザーからの追加要望で対応)
// Undo/Redoの履歴は含めない(sessionStorageの自動退避と同じ考え方で、
// 読み込んだ直後は履歴なしの状態から始める)。
export const SCHEMA_VERSION = 1;

export interface SavedFile {
  schemaVersion: number;
  savedAt: string;
  state: DomainState;
}
