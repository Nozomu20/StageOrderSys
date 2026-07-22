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
- 未実装(意図的にスコープ外。SHOULD/COULD): 左右反転(ミラー)、パートごとの人数カウント表示、名簿の並べ替え、段のadvancedモード(扇形)
- ブラウザ内への自動退避(SHOULD、5.2章)を実装済み。`sessionStorage`に`history.present`(domain stateの現在値のみ。undo履歴は含めない)を変更のたびに保存し、起動時に`createInitialDomainState()`の代わりに復元する(`sessionPersistence.ts`)。UIには一切出さない
- CSV名簿インポートを実装済み(要件定義には無い、ユーザーからの追加要望)。「姓」「名」「パート」列のヘッダー付きCSVを想定し、既存名簿への追加のみ(置き換えなし)。パート名が既存と一致しなければ自動でパートを新規作成する。
  - **重要な経緯**: 当初「.xlsxも直接読めるようにしたい」という要望でSheetJS社の`xlsx`パッケージ導入を検討したが、npm公開版(0.18.5)にプロトタイプ汚染・ReDoSの既知の脆弱性があり修正版がnpmに無いことが`npm audit`で判明したため、ユーザー判断で**xlsx非対応・CSVのみ**に変更した。CSVパーサは外部ライブラリなしで自前実装(`src/import/parseRosterCsv.ts`)。今後.xlsx対応の要望が出た場合は、SheetJS公式CDNからの修正済みビルド導入を検討すること(npmレジストリ経由は避ける)
- Undo/Redoを実装済み。`domainReducer`自体は変更せず、`historyReducer.ts`が`{past, present, future}`でラップする形(1dispatch=1履歴、上限100件)。`DomainStateContext`の`useDomainState`/`useDomainDispatch`のAPIは変更なしで、`useUndoRedo()`を新設。UIは`TabNav`右側の「元に戻す」「やり直す」ボタン+Ctrl+Z/Ctrl+Shift+Z(テキスト入力中は無効化)。選択状態・ドラッグ中の一時座標・ズーム/パン・グリッド吸着ON/OFFなどのUI状態はdomain stateと分離済みだったため、そのままUndo対象外になっている
- PNG/PDF出力を実装済み(「出力」タブ)。タイトル・日付・団体名を入力してPNGダウンロード(1〜3倍)とA4横印刷に対応。印刷CSSは`flex:1`だとページ計算とSVGの縦横比が絡んで複数ページに分割されるバグがあったため、`.print-stage`の高さは固定mm値にしている
- 配置エディタの支援機能をひととおり実装済み:
  - 団員の個別追加フォーム(`AddMemberForm.tsx`、一括貼り付けとは別)
  - コマの選択・shift+クリックでの複数選択・「未配置に戻す」(`UNPLACE_MEMBERS`)・「横一列に整列」(`ALIGN_MEMBERS_ROW`、選択メンバーの平均Y・平均X中心に`personSpacingMm`間隔で並べ替え)
  - コマの重なり警告(`personSpacingMm`未満の距離のペアに赤い破線リングを表示。`StageSvgCanvas`内で都度計算)
  - 中心線ガイド(`GuideLines.tsx`)。段の境界は各段の矩形の枠線で表現済みのため追加のガイドは無し
  - グリッド吸着(ON/OFFは配置エディタのローカルUI状態、間隔は`settings.snapIntervalMm`としてSettings画面から変更可能)
  - ズーム(ホイール、カーソル位置を中心に)/パン(背景ドラッグ)。`viewportOverride`(SVGのviewBox 4値)をPlacementEditorScreenのローカル状態として持ち、一度操作すると自動フィットから独立する。「表示をリセット」ボタンで解除
    - **ハマった点**: パン/ズームでSVGのviewBox(SVG要素自身のローカル空間)を直接書き換える処理は、`group`(`<g transform="scale(1,-1)">`)のCTMではなく**SVG要素自身**のCTM(`svg.getScreenCTM()`)を使うこと。groupのCTMはドメインmm座標(Y反転前)→画面の変換であり、viewBoxはY反転後(SVG自身のローカル)空間の値なので、groupのCTMを使うとY軸だけ符号が反転し、パン・ズームの向きが逆になる
- 新しい「設定」タブを追加(`SettingsScreen.tsx`)。占有幅・コマ直径・文字サイズ・グリッド吸着間隔をUIから変更できる
- 段の高さをプリセット(5寸/7寸/1尺/1尺5寸/2尺、`heightPresets.ts`)+その他自由入力(mm/尺寸切り替え、`shakuSunToMm`/`mmToShakuSun`)で選べるようにし、「全段を同じ高さに設定」の一括ボタンも追加。`TierCard`はuseEffectで`tier.height_mm`の外部変化(一括設定など)に表示を同期させている
- Prop(指揮者・ピアノ)の配置を実装済み。指揮者は団員コマと同じ丸(固定色+「指揮」ラベル)、ピアノは簡略化したグランドピアノの上面形(`PropsLayer.tsx`の`PIANO_PATH`、要件定義8章の未決事項につき正確な形ではなく模式図)。「指揮者を追加」「ピアノを追加」ボタンで追加し、団員コマと同じドラッグ機構で移動、選択中はピアノのみ回転ボタン(±30度)を表示。指揮者台の有無の切り替えは今回見送り(SHOULD相当のため)
- 決定事項の補足:
  - 段のY方向位置は「前の段の奥行きの累積」で自動決定(`computeTierRanges`)
  - segmentのoffsetX/Y基準となる「段の中心」はステージ中心(X=0)と一致させる。simpleモードでは常に0固定
  - 配置済み/未配置はPlacementの存在有無で判定し、Memberにフラグは持たせない
  - 1人あたりの占有幅(500mm)・コマ直径(400mm)・文字サイズ(120mm)は`src/state/settings.ts`に暫定値として置いている。要件定義8章の未決事項のため、実装しながら調整する前提
- ステージ設定を「板(山台)をプルダウンで選んで何枚並べるか」ベースに作り直した(当初の「幅・奥行を直接数値入力」から変更):
  - **床はもう段(Tier)ではない**。`Stage.tiers`は実際に組む段だけを表し、`order=0`が最前列の段(旧仕様の「床」はここから除外)。床は「どの段の範囲にも入らない場所」として`StageSvgCanvas`側で自動描画するだけで、入力欄・データは持たない
  - **1段=1種類の板だけ**(異なる幅の板を同じ段で混在させることはしない、と確認済み)。プルダウンで板(幅×奥行のセット。`src/domain/boardCatalog.ts`の`BOARD_CATALOG`)を選び、枚数を入力すると、板1枚=segment1つとして`createSegmentsFromBoard`が横並びに自動生成する(段の型自体は変更なし。もともと「segments配列で持つ」設計にしていたのが活きた形)
  - `BOARD_CATALOG`は要件定義には無い、特定会場の規格を暫定的に埋め込んだもの(幅6尺/5尺/4尺/3尺×奥行3尺、幅6尺×奥行6尺)。プルダウンには「その他(自由入力)」もあり、カタログにない規格にも対応できる。他会場の規格が増えたら`boardCatalog.ts`に追加していく想定
  - `findTierAt`は「どの段の範囲にも入らない=床」を`undefined`で表すようにした(以前は最も近い段にフォールバックしていたが、床が段でなくなったため意味が変わった)