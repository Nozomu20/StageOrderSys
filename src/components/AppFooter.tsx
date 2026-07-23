// 問い合わせ導線。外部リンクのみで、ツール本体の動作
// (通信を一切行わない)には影響しない。
export function AppFooter() {
  return (
    <footer className="app-footer">
      <span>
        ご意見・不具合報告は
        <a
          href="https://forms.gle/g3Pjeze9YgsN6a4GA"
          target="_blank"
          rel="noopener noreferrer"
        >
          フォーム
        </a>
        または
        <a
          href="https://x.com/mrok_0220"
          target="_blank"
          rel="noopener noreferrer"
        >
          XのDM
        </a>
        まで
      </span>
    </footer>
  );
}
