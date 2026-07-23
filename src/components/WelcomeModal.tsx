import { useState } from "react";

const STORAGE_KEY = "stageOrderSys.hasSeenWelcome";

// 初回訪問時にだけ表示する案内。通信を行わないことの説明と問い合わせ先を示す。
// localStorageに既読フラグを持つだけで、これ自体も外部との通信は発生しない。
export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== "true";
    } catch {
      return false;
    }
  });

  function close() {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // localStorageが使えない環境でも、閉じる操作自体は成立させる。
    }
    setIsOpen(false);
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={close}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="welcome-modal-title" style={{ marginBottom: "var(--space-3)" }}>
          はじめに
        </h2>
        <p>
          合唱団のステージ配置図(オーダー表・立ち位置表)を作成するツールです。
          団員登録から配置、PNG・PDF出力まで、この画面の中だけで完結します。
        </p>
        <p>
          <strong>
            入力した団員名簿や配置は、一切サーバーに送信されません。
          </strong>
          通信を行わないクライアント完結型のツールなので、すべてこのブラウザの中だけで処理されます。
        </p>
        <p>
          ご意見・不具合報告は、
          <a
            href="https://forms.gle/g3Pjeze9YgsN6a4GA"
            target="_blank"
            rel="noopener noreferrer"
          >
            こちらのフォーム
          </a>
          、または
          <a
            href="https://x.com/mrok_0220"
            target="_blank"
            rel="noopener noreferrer"
          >
            XのDM
          </a>
          までお願いします。
        </p>
        <button className="btn-primary" onClick={close} style={{ marginTop: "var(--space-2)" }}>
          はじめる
        </button>
      </div>
    </div>
  );
}
