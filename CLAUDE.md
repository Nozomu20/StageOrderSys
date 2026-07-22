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
- 第1段階の実装が一通り完了:
  - `src/domain/`: Stage/Tier/Segment/Part/Member/Placement/Propの型と、段のY方向積み上げ(`tierLayout.ts`)、表示名自動解決(`displayName.ts`)
  - `src/state/`: domain state用の単一reducer(`domainReducer.ts`)。UI状態(タブ・選択・ドラッグ中の一時座標)はdomain stateと分離し、Undo/Redoの対象に含めない設計
  - `src/coords/`: SVGのuser space自体をmm相当として扱い、Y軸反転はSVGルート直下の`<g transform="scale(1,-1)">`一箇所に集約。ポインタ→mm変換は`pointerToMm.ts`にのみ存在
  - 画面: ステージ設定(段のsimpleモードのみ)・団員登録(一括貼り付け・パート管理・表示名プレビュー)・配置エディタ(未配置一覧からのドラッグ配置、既存コマの再ドラッグ)
- 未実装(意図的にスコープ外。第2段階以降): ズーム/パン、Prop(指揮者・ピアノ)の描画、整列・グリッド吸着、重なり警告、Undo/Redo本体、PNG/PDF出力
- 決定事項の補足:
  - 段のY方向位置は「前の段の奥行きの累積」で自動決定(`computeTierRanges`)
  - segmentのoffsetX/Y基準となる「段の中心」はステージ中心(X=0)と一致させる。simpleモードでは常に0固定
  - 床(order=0)の`height_mm`は0固定
  - 配置済み/未配置はPlacementの存在有無で判定し、Memberにフラグは持たせない
  - 1人あたりの占有幅(500mm)・コマ直径(400mm)・文字サイズ(120mm)は`src/state/settings.ts`に暫定値として置いている。要件定義8章の未決事項のため、実装しながら調整する前提