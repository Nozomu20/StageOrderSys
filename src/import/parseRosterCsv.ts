export interface ImportedMemberRow {
  familyName: string;
  givenName?: string;
  partName: string;
}

export interface ParseRosterCsvResult {
  rows: ImportedMemberRow[];
  skippedCount: number;
}

// ダブルクォートで囲まれたフィールド内のカンマ・改行・エスケープされた
// ""に対応する簡易CSVパーサ(外部ライブラリを使わないための自前実装)。
function parseCsvTable(text: string): string[][] {
  const src = text.replace(/^﻿/, ""); // Excel書き出し時のBOMを除去
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < src.length) {
    const char = src[i];
    if (inQuotes) {
      if (char === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += char;
      i++;
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (char === "\r") {
      i++;
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += char;
    i++;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ""));
}

const DEFAULT_PART_NAME = "未設定";

// ヘッダー行に「姓」「名」「パート」の列を期待する(順不同)。
export function parseRosterCsv(text: string): ParseRosterCsvResult {
  const table = parseCsvTable(text);
  if (table.length === 0) return { rows: [], skippedCount: 0 };

  const header = table[0].map((h) => h.trim());
  const familyIdx = header.indexOf("姓");
  const givenIdx = header.indexOf("名");
  const partIdx = header.indexOf("パート");

  if (familyIdx === -1) {
    throw new Error("ヘッダー行に「姓」列が見つかりません");
  }

  const rows: ImportedMemberRow[] = [];
  let skippedCount = 0;
  for (const line of table.slice(1)) {
    const familyName = (line[familyIdx] ?? "").trim();
    if (!familyName) {
      skippedCount++;
      continue;
    }
    const givenName = givenIdx >= 0 ? (line[givenIdx] ?? "").trim() : "";
    const partName =
      (partIdx >= 0 ? (line[partIdx] ?? "").trim() : "") || DEFAULT_PART_NAME;
    rows.push({
      familyName,
      givenName: givenName || undefined,
      partName,
    });
  }

  return { rows, skippedCount };
}
