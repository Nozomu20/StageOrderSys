import { useRef, useState } from "react";
import {
  useDomainDispatch,
  useDomainState,
  useLoadDomainState,
} from "../../state/DomainStateContext";
import { parseSavedFileJson } from "../../import/importJson";
import type { DomainState } from "../../state/domainState";
import { FILE_EXTENSION } from "../../state/savedFile";
import { TierCard } from "./TierCard";
import { AllTierHeightForm } from "./AllTierHeightForm";

export function StageSettingsScreen() {
  const state = useDomainState();
  const dispatch = useDomainDispatch();
  const loadState = useLoadDomainState();
  const sortedTiers = [...state.stage.tiers].sort((a, b) => a.order - b.order);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  // パース済みで、確認待ちの読み込み内容。現在の作業内容を丸ごと
  // 置き換える操作なので、ネイティブのconfirm()ではなくアプリ内の
  // モーダルで確認を挟む(見た目の統一とテストのしやすさのため)。
  const [pendingLoad, setPendingLoad] = useState<DomainState | null>(null);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLoadError(null);
    try {
      const text = await file.text();
      setPendingLoad(parseSavedFileJson(text));
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "ファイルの読み込みに失敗しました。",
      );
    }
  }

  function confirmLoad() {
    if (!pendingLoad) return;
    loadState(pendingLoad);
    setPendingLoad(null);
  }

  return (
    <div className="screen">
      <h2>ステージ設定</h2>
      <p className="screen-hint">
        床(段以外のステージスペース)は自動的に描画されるため、ここでの設定は不要です。
      </p>

      <div className="card">
        <div className="field-row" style={{ marginBottom: 0 }}>
          <span className="field-label">作業内容の読み込み</span>
          <button onClick={() => fileInputRef.current?.click()}>
            ファイルから読み込む
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={`.${FILE_EXTENSION},.json`}
            style={{ display: "none" }}
            onChange={handleFileSelected}
          />
        </div>
        {loadError && (
          <p
            style={{
              color: "var(--color-danger)",
              fontSize: "var(--font-sm)",
              margin: "8px 0 0",
            }}
          >
            {loadError}
          </p>
        )}
        <p className="screen-hint" style={{ margin: "8px 0 0" }}>
          「出力」画面で保存したファイル(.{FILE_EXTENSION})を読み込んで、続きから作業できます。
        </p>
      </div>

      {sortedTiers.length > 0 && <AllTierHeightForm />}
      {sortedTiers.map((tier, i) => (
        <TierCard
          key={tier.id}
          tier={tier}
          index={i}
          isFirst={i === 0}
          isLast={i === sortedTiers.length - 1}
        />
      ))}
      <button className="btn-primary" onClick={() => dispatch({ type: "ADD_TIER" })}>
        + 段を追加
      </button>

      {pendingLoad && (
        <div className="modal-overlay" onClick={() => setPendingLoad(null)}>
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="load-confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="load-confirm-title" style={{ marginBottom: "var(--space-3)" }}>
              ファイルの読み込み
            </h2>
            <p>
              現在の作業内容を、読み込んだ内容で置き換えます。この操作はUndo/Redoの履歴もリセットします。よろしいですか?
            </p>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <button className="btn-primary" onClick={confirmLoad}>
                読み込む
              </button>
              <button onClick={() => setPendingLoad(null)}>キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
