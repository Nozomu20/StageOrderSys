// 問い合わせ導線。外部リンクのみで、ツール本体の動作
// (通信を一切行わない)には影響しない。
export function AppFooter() {
  return (
    <footer className="app-footer">
      <a
        className="app-footer-link"
        href="https://forms.gle/g3Pjeze9YgsN6a4GA"
        target="_blank"
        rel="noopener noreferrer"
      >
        ご意見・不具合報告はこちら
      </a>
    </footer>
  );
}
