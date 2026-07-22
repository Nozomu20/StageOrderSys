import { useState, type ChangeEvent } from "react";
import { useDomainDispatch } from "../../state/DomainStateContext";
import { parseRosterCsv } from "../../import/parseRosterCsv";

export function ImportRosterForm() {
  const dispatch = useDomainDispatch();
  const [message, setMessage] = useState<string | null>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // 同じファイルを続けて選び直せるようにする
    if (!file) return;

    try {
      const text = await file.text();
      const { rows, skippedCount } = parseRosterCsv(text);
      if (rows.length === 0) {
        setMessage("取り込める行が見つかりませんでした。");
        return;
      }
      dispatch({ type: "IMPORT_MEMBERS", rows });
      setMessage(
        `${rows.length}件を取り込みました。` +
          (skippedCount > 0 ? `(姓が空の${skippedCount}行はスキップしました)` : ""),
      );
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "CSVの読み込みに失敗しました。",
      );
    }
  }

  return (
    <div>
      <h3>CSVから団員をインポート</h3>
      <p style={{ fontSize: 12, color: "#666" }}>
        1行目をヘッダーとし、「姓」「名」「パート」の列を持つCSVファイルに対応しています(「名」は省略可)。
        パート名が既存のパートと一致しない場合は、新しいパートとして自動的に追加します。
        既存の名簿には追加され、置き換えにはなりません。
      </p>
      <input type="file" accept=".csv,text/csv" onChange={handleFileChange} />
      {message && <p style={{ fontSize: 12 }}>{message}</p>}
    </div>
  );
}
