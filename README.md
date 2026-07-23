# 合唱オーダー表作成ツール(StageOrderSys)

合唱団のステージ配置(オーダー表・立ち位置表)を、雛壇の実寸に基づいて作成し、
PNG画像やA4横PDFとして書き出せる、クライアント完結型のWebアプリです。

**→ [今すぐ使う](https://nozomu20.github.io/StageOrderSys/)**(インストール・登録不要)

## これは何をするツールですか

- 山台(平台)の規格・段数から、ステージの雛壇を実寸(mm)で組み立てます
- 団員名簿をパートごとに色分けし、立ち位置をドラッグ&ドロップで配置します
- グリッド吸着・スマートガイド・Undo/Redoなど、配置作業を助ける機能が一通り揃っています
- タイトル・日付・団体名を添えて、PNG画像またはA4横PDFとして書き出せます

## プライバシーについて

**入力した団員名簿や配置は、一切サーバーに送信されません。**
アカウント登録も不要で、アクセスして、入力して、出力したら終わりです。すべての処理はこのアプリを開いたブラウザの中だけで完結します(通信を一切行わないクライアント完結型アプリです)。

## 開発環境

- Vite + React 19 + TypeScript
- lintは[oxlint](https://oxc.rs/docs/guide/usage/linter.html)

```bash
npm install
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド
npm run lint     # lint
```

詳しい設計方針・実装状況は [CLAUDE.md](./CLAUDE.md) を参照してください。

## お問い合わせ

不具合報告・ご要望は、以下のいずれかまでお願いします。

- [問い合わせフォーム](https://forms.gle/g3Pjeze9YgsN6a4GA)
- [X (@mrok_0220) のDM](https://x.com/mrok_0220)

## ライセンス

MIT License を想定しています。
