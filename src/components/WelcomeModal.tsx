import { useState } from "react";

const STORAGE_KEY = "stageOrderSys.welcomeContentVersion";

// アップデート情報を追加するたびにこの値を変更する。保存されている値と
// 異なる場合にモーダルを再表示するので、既読フラグ(boolean)ではなく
// バージョン文字列として持つ。
const CONTENT_VERSION = "2026-07-23";

interface UpdateNote {
  date: string;
  summary: string;
}

// 新しい項目ほど先頭に追加する。
const UPDATE_NOTES: UpdateNote[] = [
  {
    date: "2026-07-23",
    summary:
      "作業内容をファイルに保存して、後日続きから作業できるようになりました",
  },
  {
    date: "2026-07-23",
    summary: "スマホ・タブレットでも配置作業ができるようになりました",
  },
  {
    date: "2026-07-23",
    summary: "PNG画像の書き出しが安定するよう改善しました",
  },
];

// 初回訪問時、およびアップデート情報が増えるたびに表示する案内。
// 通信を行わないことの説明と問い合わせ先、最近の更新内容を示す。
// localStorageに表示済みバージョンを持つだけで、これ自体も外部との
// 通信は発生しない。
export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== CONTENT_VERSION;
    } catch {
      return false;
    }
  });

  function close() {
    try {
      localStorage.setItem(STORAGE_KEY, CONTENT_VERSION);
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

        {UPDATE_NOTES.length > 0 && (
          <>
            <h3 style={{ marginTop: "var(--space-4)" }}>アップデート情報</h3>
            <ul style={{ paddingLeft: "1.2em", margin: "0 0 var(--space-3)" }}>
              {UPDATE_NOTES.map((note, i) => (
                <li key={i} style={{ marginBottom: 4 }}>
                  <span
                    style={{
                      color: "var(--color-text-muted)",
                      fontSize: "var(--font-sm)",
                    }}
                  >
                    {note.date}
                  </span>{" "}
                  {note.summary}
                </li>
              ))}
            </ul>
          </>
        )}

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
