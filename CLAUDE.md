# CLAUDE.md

# 合唱オーダー表（立ち位置表）作成ツール

合唱団のステージ配置図を作成し、PNG／A4横PDFで出力する
クライアント完結型のWebアプリ。OSSとして公開する。

## 仕様

要件定義は @../doc/requirements.md にある(このリポジトリは `StageOrderSys/StageOrderSys` にネストしており、要件定義は1階層上の `doc/` にある)。
仕様の判断に迷ったら、推測せず必ずそこを確認すること。
要件定義に書かれていない判断が必要になったら、実装する前に確認する。

## 絶対に守る設計制約

これらは後から変更するとデータ構造の作り直しになるため、必ず守ること。

- 内部データはすべて **mm 単位の数値**で保持する。尺貫法は表示・入力時のみ変換する
- 座標系の原点は**ステージ中央・最前段の前端**。X軸は客席から見て右が正、Y軸は舞台奥が正
- 図は**客席から見た向き**で描く
- 描画は **SVG** で行う。図をCanvasで描かない（CanvasはPNG書き出しのラスタライズ時のみ使う）
- 段（Tier）は simple モードでも**常に segments 配列**で保持する。単一の矩形として持たない
- Placement に段IDを持たせない。**どの段に立つかは y 座標から導出する**
- 通信を一切行わない。外部APIを呼ばない
- 1人あたりの占有幅、コマの直径、文字サイズは**ハードコードせず設定値**として持つ

## 開発方針

- 現在は第1段階（SVG描画・段のsimpleモード・ドラッグ配置）のスコープ
- 未実装の機能を先回りして作らない。SHOULD/COULD の機能に手を出さない
- 外部ライブラリを追加する前に必ず相談する
- TypeScript の型は厳密に。any を使わない

## 現在の状況

- 開発環境: Vite + React 19 + TypeScript。lintはoxlint(ESLintではない)。パッケージ管理はnpm
- 主要ディレクトリ:
  - `src/domain/`: Stage/Tier/Segment/Part/Member/Placement/Propの型とドメインロジック(段のY方向積み上げは`tierLayout.ts`、表示名自動解決は`displayName.ts`、山台カタログは`boardCatalog.ts`)
  - `src/state/`: domain state用の単一reducer(`domainReducer.ts`)を`historyReducer.ts`がUndo/Redo用にラップ(`{past, present, future}`、1dispatch=1履歴、上限100件)。UI状態(タブ・選択・ドラッグ中座標・ズーム/パン等)はdomain stateと分離しUndo対象外
  - `src/coords/`: SVGのuser space自体をmm相当として扱う。ポインタ→mm変換は`pointerToMm.ts`、スマートガイドは`smartGuides.ts`
- 画面: ステージ設定・団員登録・配置エディタ・出力・設定の5画面。タブは「ステージ設定→団員登録→配置エディタ→出力」の4ステップ表示+「設定」は補助タブ
- 実装済みの主な機能:
  - **ステージ設定**: 山台(`BOARD_CATALOG`、要件定義には無い暫定の会場規格)をプルダウンで選び枚数指定、段の高さはプリセット(5寸〜2尺)+自由入力(mm/尺寸)、全段一括設定。1段=1種類の板のみ。床はTierではなく`StageSvgCanvas`側で自動描画
  - **団員登録**: 個別追加・一括貼り付け・CSVインポート(要件定義外。姓/名/パート列、既存名簿への追加のみ)、パート色は固定8色パレットから選択
  - **配置エディタ**: ドラッグ配置、複数選択+横一列整列、重なり警告、グリッド吸着、スマートガイド(他コマ/段境界/中心線に吸着、グリッドとは独立で近い方を採用)、ズーム(スライダー25〜300%)/パン、指揮者・ピアノ配置、Undo/Redo
  - **出力**: PNG(1〜3倍)/A4横印刷、タイトル・日付・団体名。書き出し中はボタンを無効化して多重実行を防止
  - **設定**: 占有幅・コマ直径・文字サイズ・グリッド吸着間隔(いずれも要件定義8章の未決事項につき暫定値)
  - ブラウザ自動退避(`sessionStorage`、domain stateの現在値のみ、UIには出さない)
  - 初回訪問時の案内モーダル(通信しない旨+問い合わせ先を一度だけ表示、`localStorage`で既読管理)、フッターに問い合わせリンク(Googleフォーム/X DM)
  - 作業内容の保存/読み込み(要件定義5.3のCOULD項目、ユーザーからの追加要望。セッションを超えて続きから作業したい向け)。domain state全体(Undo/Redo履歴は含まない)を`schemaVersion`付きJSONにした上でbase64で難読化し、独自拡張子`.stageorder`(`src/state/savedFile.ts`の`FILE_EXTENSION`)で書き出す。テキストエディタで開いても団員名簿がそのまま見えないようにするための難読化であり、暗号化ではない(このプロジェクトはOSSでソースが公開されているため、固定鍵の暗号化等は「隠しているだけ」で実質的な保護にはならないと判断した)。本当の保護が必要になったらパスワード付き暗号化(Web Crypto API)を検討すること
    - 保存は「出力」画面、読み込みは「ステージ設定」画面(`src/export/exportJson.ts`/`src/import/importJson.ts`がそれぞれ担当)。読み込み側は難読化前の素のJSON(以前のバージョンで保存したファイル)もフォールバックで読めるようにしている
    - 読み込みは現在の作業内容を丸ごと置き換える(Undo/Redo履歴もリセット)ため、アプリ内モーダルで確認を挟む。`historyReducer.ts`に`LOAD_STATE`アクションを追加し、`DomainStateContext.tsx`の`useLoadDomainState()`から呼び出す
- 意図的に未実装(SHOULD/COULD): 左右反転(ミラー)、パートごとの人数カウント表示、名簿の並べ替え、段のadvancedモード(扇形)
- 配布: GitHub Pages(`https://nozomu20.github.io/StageOrderSys/`)。リポジトリはPublic。`vite.config.ts`に`base: '/StageOrderSys/'`。`main`へのpushで`.github/workflows/deploy.yml`が自動ビルド・公開する
- ブランチ運用: MVPフェーズ完了後、`MVP`ブランチは削除済み。以降は`dev`からfeatureブランチを切って機能追加・バグ修正を行い、`dev`にマージ。区切りのいいところで`dev`→`main`にマージしてpushする(`main`へのpushが本番公開のトリガーになるため)
- レスポンシブ対応を実装済み(スマホでもPCと遜色ない編集体験を目標)。mm座標系・SVG描画・ドメインロジックには手を入れず、CSS/操作方法のみで対応:
  - ブレークポイントは640px(スマホ)・960px(タブレット/配置エディタのサイドバー切り替え)
  - `.field-row`は640px以下で縦積みに、団員一覧テーブルは`.table-scroll`で横スクロール対応
  - 配置エディタのサイドバーは960px以下で画面下からのドロワーになる(`.placement-sidebar.is-open`、`PlacementEditorScreen.tsx`の`isSidebarOpen`)。未配置一覧からドラッグを開始すると自動でドロワーを閉じ、キャンバス全体を見ながらドロップできるようにしている
  - コマ・指揮者・ピアノは、見た目の大きさはそのままにタップ/ドラッグの当たり判定だけ広げてある(`ChipLayer.tsx`/`PropsLayer.tsx`の透明な当たり判定用circle/rect、`TOUCH_HIT_PADDING_MM`)
  - スマホにはshiftキーが無いため、「複数選択モード」チェックボックスを追加(ON中はタップだけで複数選択の追加/解除ができる)

## 非自明な注意点(ハマりどころ)

- パン/ズームでSVGのviewBoxを書き換える処理は、`group`(`scale(1,-1)`のCTM)ではなく**SVG要素自身**のCTM(`svg.getScreenCTM()`)を使うこと。groupのCTMを使うとY軸の符号が反転し、パン・ズームの向きが逆になる
- 印刷CSSは`.print-stage`の高さを`flex:1`ではなく固定mm値にすること(`flex:1`だとページ計算とSVGの縦横比が絡んで複数ページに分割される)
- 名簿インポートはCSVのみ対応。xlsxパッケージ(SheetJS npm版0.18.5)にプロトタイプ汚染・ReDoSの既知脆弱性があり修正版がnpmに無いため、自前のCSVパーサ(`src/import/parseRosterCsv.ts`)にした。.xlsx対応が必要になったらSheetJS公式CDNの修正済みビルドを検討し、npmレジストリ経由は避けること
- **解消済み**: PNG書き出しは、以前は「1倍」をmmの数値をそのままpxとして使っていたため、大きなステージ(段数・板枚数が多い)ほど画像が際限なく巨大化し、解像度2〜3倍でcanvasサイズの上限に達して失敗することがあった。`exportPng.ts`の`BASE_LONG_EDGE_PX`(1800px)を基準に、ステージの長辺がそのくらいのpxになるよう都度スケールを計算する方式に変更し解消した(1倍で長辺1800px、2倍で3600px、3倍で5400px、ステージの実寸に関わらず一定)。ヘッダーのタイトル・日付・団体名が極端に小さく見えていたのもこれが原因だったため、あわせて改善された
- package-lock.jsonをmacOSで生成するとCIのLinux環境で`npm ci`が失敗することがある(`@emnapi/*`等のoptional dependencyのバージョンずれ)。CI失敗時はnode_modules+lockfileを再生成して整合を取る
- `window.confirm()`/`alert()`はネイティブのブラウザダイアログで、ブラウザ自動操作(Chrome拡張経由の自動化)からは一切操作できずページごと固まる。確認が必要な操作は、既存の`.modal-overlay`/`.modal-card`(`WelcomeModal.tsx`等)と同じアプリ内モーダルで実装すること
- GitHub Actionsのpush通知(webhook)が数分〜十数分単位で遅延することがある(原因不明、GitHub側の一時的な問題と思われる)。pushしても`Actions`タブに反映が無い場合は、`workflow_dispatch`の「Run workflow」ボタンで手動実行できる(`deploy.yml`に`workflow_dispatch:`を設定済み)