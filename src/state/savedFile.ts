import type { DomainState } from "./domainState";

// セッションを超えて続きから作業できるようにするための、独自の保存形式。
// (要件定義5.3のCOULD「JSONのエクスポート/インポート」に相当。ユーザーからの追加要望で対応)
// Undo/Redoの履歴は含めない(sessionStorageの自動退避と同じ考え方で、
// 読み込んだ直後は履歴なしの状態から始める)。
export const SCHEMA_VERSION = 1;
// 「このツール専用のファイル」と分かるよう、拡張子は.jsonではなく
// 独自のものにする。中身はテキストエディタでそのまま読めると
// 団員名簿が丸見えになってしまうため、base64で難読化する(本格的な
// 暗号化ではなく、素で開かれた時に読めなくする程度が目的)。
export const FILE_EXTENSION = "stageorder";

export interface SavedFile {
  schemaVersion: number;
  savedAt: string;
  state: DomainState;
}

// UTF-8文字列 <-> base64の変換。TextEncoder/DecoderはUnicodeを
// 正しく扱えるが、btoa/atob自体はバイト列(Latin1)しか扱えないため、
// 一度バイト列を経由する。
export function encodeObscured(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

export function decodeObscured(encoded: string): string {
  const binary = atob(encoded.trim());
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
