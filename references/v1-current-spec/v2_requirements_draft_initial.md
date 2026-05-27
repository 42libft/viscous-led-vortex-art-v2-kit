# 手弁当蒼氓蟲譜 二号機 仕様書・要件定義・作業工程 v0.1

作成日: 2026-05-27  
対象: `42libft/viscous-led-vortex-art` の二号機を、ゼロから整理して作り直すための叩き台

---

## 0. この文書の位置づけ

この文書は、現行一号機をそのまま継ぎ足すのではなく、二号機を「作品として育てられる柔軟なリポジトリ」にするための初期仕様である。

一号機は、短冊状LEDパネル、3つの黒い渦、液体・細胞膜・油膜・宇宙・発光粒・LEDグリッドを WebGL2 fragment shader で生成する技術検証として十分に成立している。一方で、現在の問題は「見た目が足りない」以前に、作品の観察モデル、物理、色、シェーダ、UI、実験用パラメータが同じ場所に混ざっていることにある。

二号機の目的は、最初から「後で変えられる構造」を持つこと。  
つまり、単に本家っぽい絵を一度出すのではなく、蒼氓蟲譜的な短冊状の光る標本、黒い穴、流体膜、LED面、発光点、色の相転移を、別々の責務として調整できるようにする。

---

## 1. 作品ゴール

### 1.1 一文ゴール

暗闇に浮かぶ縦長LED標本柱の中で、3つの黒い穴がゆっくり漂い、膜・液体・細胞・星・油膜・発光粒が穴に引き寄せられたり歪められたりしながら、時間とともに別の生態系へ変化していくリアルタイム生成作品を作る。

### 1.2 二号機の方向性

二号機は「本家の完全コピー」ではなく、観察された構成要素を抽象化して、自分の作品として操作できる実装にする。

重視するものは以下。

- 短冊状の暗闇展示感
- 黒い穴 / 眼 / ブラックホールの存在感
- LED面の物理的な粒状感
- 水彩・油膜・細胞膜・葉脈・宇宙が同じ面上で相転移する感じ
- 色の切り替わりが単なるパレット変更ではなく、素材が変化したように見えること
- ランダムに派手な絵を出すのではなく、いつ見ても「作品の世界」に戻ってくること

---

## 2. 参考写真から読み取る視覚言語

添付写真から、二号機で拾うべき要素を次のように分解する。

### 2.1 画面構成

画面のほとんどは黒で、作品本体は中央の細長い矩形として浮かぶ。  
周囲の闇は単なる余白ではなく、作品の発光と対比する展示空間である。したがって、二号機では `canvas` 全面を描画しつつ、実際の作品領域は `panelUv` で短冊パネルに正規化する。

### 2.2 黒い穴

黒い穴は単なる黒円ではない。  
写真では黒円の周囲に、渦巻き、光沢リング、歪んだ膜、吸い込まれるような周辺構造が見える。

二号機では、黒穴を以下の3層で扱う。

1. 完全に黒いコア
2. 周囲のリング / レンズ / 渦
3. 背景素材を曲げる重力場

これにより、黒円が「乗っている」状態ではなく、背景全体を変形させる主体に見えるようにする。

### 2.3 素材感

写真には、少なくとも4種類の見え方がある。

- 白地に近い水彩・鉱物・粘土・膜のような状態
- 濃い青の宇宙 / 深海 / 星雲のような状態
- マゼンタとグリーンのサイケデリックな細胞膜状態
- 青紫とピンクの花弁 / 葉脈 / 血管のような状態

このため、二号機では「色モード」だけでなく「素材モード」を分ける。  
色を変えるだけではなく、模様の生成ロジック、膜の輪郭、流れの速度、LEDの見え方、黒穴の視認性まで一緒に変える。

### 2.4 LED面

写真では、LED / ディスプレイのピクセル面がかなり重要である。  
高精細なCGをただ出すのではなく、網目、ドット、スキャンライン、面の粒状感があることで、展示物としての物体感が出る。

二号機ではLED処理を最後の後処理レイヤーとして固定化する。素材シェーダが変わっても、LED面は共通で乗る。

---

## 3. 現行一号機の診断

### 3.1 良いところ

一号機は、以下の核をすでに持っている。

- Vite + TypeScript + WebGL2 で動く
- texture asset なしでも抽象映像が出せる
- 短冊状パネルがある
- 3つの黒い渦がある
- 渦周辺の歪みがある
- lil-gui でパラメータ調整できる
- LEDグリッド、発光粒、Auto遷移がある
- GitHub Pages に出せる構成がある

### 3.2 つらいところ

二号機で解消すべき構造的問題は以下。

- `src/main.ts` に shader、WebGL初期化、物理、GUI、DOM UI、Auto遷移が集中している
- 見た目の実験と作品の確定仕様が混ざっている
- shader が巨大化して、どの変更がどの見た目に効くか追いづらい
- Bloom / Forest / Cloud / Universe などのモードが増えるほど条件分岐が複雑になる
- パラメータの意味がコード中の magic number として散らばる
- 「この状態が良い」と思ったプリセットを保存しにくい
- コーディングエージェントに任せると、局所修正の積み重ねでさらに絡まる可能性が高い

### 3.3 二号機での結論

二号機では、最初から以下の責務分離を守る。

- `renderer`: WebGL初期化、program、uniform、resize、draw
- `simulation`: 渦の物理、接近、押し合い、swap
- `settings`: 設定スキーマ、初期値、型、安全な範囲
- `presets`: 視覚プリセット、Auto遷移、シード
- `controls`: lil-gui、右下UI、fullscreen
- `shaders`: GLSL文字列または `.glsl` ファイル群
- `visual-model`: 素材モード、色モード、LED処理、黒穴処理の仕様

---

## 4. 技術方針

### 4.1 基本スタック

MVPでは現行と同じく以下を採用する。

- Vite
- TypeScript
- WebGL2
- lil-gui
- Vanilla DOM / Canvas
- texture asset は原則なし

理由は、すでに一号機で成立しており、複雑なフレームワークを入れるよりシェーダと物理の整理に集中できるため。

### 4.2 将来追加してよいもの

二号機MVP後に、必要なら以下を追加する。

- Vitest: `vortexSystem` や `settings` の単体テスト
- GLSL raw import: shaderをファイル分割するため
- screenshot / capture helper: プリセット比較用
- パラメータ保存: `localStorage` または URL query
- reference board: 参照写真と現在出力の比較ページ

### 4.3 採用しないもの

MVPでは以下は採用しない。

- React / Vue などのUIフレームワーク
- Three.js
- 複雑なFBO多段レンダリング
- 動画・画像テクスチャ依存
- 作品の主構造をCSSやDOMで作る方式

ただし、将来の表現強化としてFBOやテクスチャを使う余地は残す。

---

## 5. 目標ディレクトリ構成

```text
viscous-led-vortex-art-v2/
├── docs/
│   ├── VISUAL_SPEC.md
│   ├── REQUIREMENTS.md
│   ├── IMPLEMENTATION_PLAN.md
│   └── AGENT_PROMPTS.md
├── public/
│   └── refs/                         # 参照画像を置く場合。公開範囲に注意
├── src/
│   ├── app/
│   │   ├── bootstrap.ts              # 起動
│   │   └── frameLoop.ts              # rAF / dt / lifecycle
│   ├── renderer/
│   │   ├── GlRenderer.ts             # WebGL2初期化・draw
│   │   ├── ShaderProgram.ts          # compile/link/error overlay
│   │   ├── UniformBinder.ts          # uniform location/cache/update
│   │   └── resizeCanvas.ts
│   ├── simulation/
│   │   ├── vortexTypes.ts
│   │   ├── vortexSystem.ts           # update / pressure / swap
│   │   └── math.ts
│   ├── settings/
│   │   ├── schema.ts                 # 型・候補・範囲
│   │   ├── defaults.ts
│   │   ├── modeMapping.ts            # GUI文字列 -> uniform数値
│   │   └── autoMorph.ts
│   ├── presets/
│   │   ├── visualPresets.ts          # Blue Universe, Pink Cell, Pale Mineralなど
│   │   └── presetUrl.ts
│   ├── controls/
│   │   ├── gui.ts
│   │   ├── appButtons.ts
│   │   └── fullscreen.ts
│   ├── shaders/
│   │   ├── fullscreen.vert.glsl
│   │   ├── main.frag.glsl
│   │   └── chunks/
│   │       ├── common.glsl
│   │       ├── noise.glsl
│   │       ├── panel.glsl
│   │       ├── vortex.glsl
│   │       ├── material_liquid.glsl
│   │       ├── material_cellular.glsl
│   │       ├── material_nature.glsl
│   │       ├── palette.glsl
│   │       ├── led.glsl
│   │       └── lighting.glsl
│   ├── types/
│   │   └── global.d.ts
│   ├── style.css
│   └── main.ts                       # bootstrapだけ呼ぶ薄い入口
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

MVP段階では `.glsl` import の設定が面倒なら、`src/shaders/*.ts` に文字列として置いてもよい。ただし、`main.ts` に直書きしないことをルールにする。

---

## 6. 機能要件

### FR-01: 短冊LEDパネル

作品本体は中央の縦長パネルとして描画される。

受け入れ条件:

- canvas は viewport 全面
- パネルは中央揃え
- パネル目標アスペクト比は初期値 `0.265`
- パネル外は黒または極暗い展示空間
- パネル内UVは `0.0 - 1.0` に正規化
- `panelAspect`, `panelHeight`, `panelMaxWidth` は settings で調整可能

### FR-02: 3つの黒穴 / 渦

3つの黒い穴が縦長パネル内を漂う。

受け入れ条件:

- 黒穴は常に3つ
- 各黒穴は `position`, `velocity`, `radius`, `spin`, `pressureState` を持つ
- 黒い中心、リング、レンズ歪みが分離している
- 渦周辺の背景が歪む
- 黒穴同士が近づくと押し合う
- 圧力が溜まったときに高速で位置交換する
- 物理更新は TypeScript 側、描画は shader 側

### FR-03: 背景素材モード

背景は複数の素材モードを持つ。

MVPの素材モード:

- `Liquid`: 高粘度流体、油膜、流れ
- `Cellular`: 細胞膜、Voronoi、境界、内部リブ
- `Mineral`: 白地・鉱物・水彩・膜
- `Universe`: 青い宇宙、星、深海
- `PetalVein`: 花弁・葉脈・血管状ライン
- `HybridAuto`: 上記を時間で混ぜる

受け入れ条件:

- 素材モードは GUI で切り替え可能
- 色だけでなく模様・膜・速度・黒穴の見え方も変わる
- shader 内では素材ごとの関数に分かれている
- Autoでは急に破綻せず、ゆっくり補間される

### FR-04: カラーモード

色は素材と独立して指定できるが、素材側の推奨色も持てる。

MVPのカラーモード:

- `Auto`
- `PaleMineral`
- `DeepBlue`
- `PinkGreen`
- `BluePurple`
- `WhiteIridescent`
- `Contrast`
- `AnalogBlackOil`

受け入れ条件:

- `ColorMode` と `MaterialMode` は別の設定
- `Contrast` は補色的に派手
- `AnalogBlackOil` は同系色と黒油膜を強める
- `Auto` は時間で滑らかに遷移する
- 明度が潰れて全面白・全面黒にならない

### FR-05: LED面処理

LEDドット、グリッド、スキャンライン、微小な輝度むらを最後に重ねる。

受け入れ条件:

- `ledStrength` で強度調整
- `ledResolutionX/Y` でドット密度調整
- ドットはパネルUVに固定される
- 素材モードを変えてもLED面は共通
- 近くで見ると表示面、遠くで見ると絵として成立する

### FR-06: 発光粒

写真に見える白い小さな発光点を再現する。

受け入れ条件:

- `fireflies` でON/OFF
- `glow` で強度
- 点はランダムだが完全ノイズではなく、素材と馴染む
- 黒穴周辺や膜の上で少し強く見える
- 点滅は非同期

### FR-07: GUI / 操作

lil-gui で主要パラメータを調整できる。

最低限のGUI:

- `renderScale`
- `speed`
- `materialMode`
- `colorMode`
- `vortexStrength`
- `vortexRadius`
- `burst`
- `storedPressure`
- `ledStrength`
- `glow`
- `fireflies`
- `autoMorph`
- `preset`
- `seed`

受け入れ条件:

- GUIの値は TypeScript 型と一致する
- 数値範囲は schema で一元管理
- 不正な組み合わせを GUI 側で防ぐ
- `?preset=...` または `?seed=...` で初期状態を指定できる
- 没入モードではGUIを隠せる

### FR-08: プリセット

二号機では「良かった瞬間」を保存できる構造にする。

初期プリセット案:

- `pale-specimen`: 白地・水彩・鉱物・黒穴
- `deep-blue-universe`: 青い宇宙・星・強い黒穴リング
- `pink-green-cell`: マゼンタ/緑の細胞膜・強いLED
- `blue-purple-vein`: 青紫の葉脈/花弁・発光粒
- `black-oil-liquid`: 黒油膜・液体・低彩度

受け入れ条件:

- プリセットはコード中の定数として管理
- GUIから切り替え可能
- URLに反映できる
- プリセット変更時に全パラメータが破綻しない

### FR-09: デバッグ表示

開発中だけ、物理やパネル境界を確認できる。

受け入れ条件:

- `debugPanel` でパネルUV、境界、渦位置を見られる
- `debugVortex` で黒穴の半径・影響範囲を確認できる
- `debugMaterial` で素材IDやmaskを確認できる
- 本番ではOFF

---

## 7. 非機能要件

### NFR-01: ビルド

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

が通ること。

### NFR-02: 型安全性

- `strict: true`
- settings は union type で定義
- GUIの文字列と uniform の数値変換を `modeMapping.ts` に集約
- `any` を使う場合は理由をコメントする

### NFR-03: 性能

目標:

- MacBookブラウザ全画面で `renderScale=0.85` 前後が実用的
- 重い場合 `renderScale=0.65` で破綻せず動く
- DPR上限は2
- WebGL2非対応時は分かりやすいエラー表示

### NFR-04: 変更しやすさ

- `main.ts` は起動だけ
- 1ファイルに複数責務を入れない
- shader chunk は役割ごとに分ける
- magic number は可能な限り settings / preset / constants に寄せる
- 「見た目の仮実装」は `experiments` またはコメントで明示する

### NFR-05: コーディングエージェント適性

- 1回の作業範囲を小さくする
- 物理とshaderとGUIを同時に大改造しない
- 各フェーズに受け入れ条件を持たせる
- 変更後は必ず `npm run build`
- 画面確認ポイントをプロンプトに入れる

---

## 8. 実装フェーズ

### Phase 0: 仕様固定前の準備

目的: 二号機の方向性と構造を決める。

作業:

- 現行repoから学ぶ要素を整理
- 参照写真を4状態に分類
- 二号機のMVP範囲を決める
- この文書を `docs/REQUIREMENTS.md` として置く
- `docs/VISUAL_SPEC.md` に写真から見た視覚要素をまとめる

完了条件:

- 何を作るかが1ページで説明できる
- MVPに入れるもの / 入れないものが決まっている
- コーディングエージェントに最初のプロンプトを渡せる

### Phase 1: 新規プロジェクト骨格

目的: きれいなリポジトリの土台を作る。

作業:

- Vite + TypeScript 初期化
- `index.html`, `src/main.ts`, `src/style.css`
- `app`, `renderer`, `simulation`, `settings`, `controls`, `shaders`, `presets` を作る
- `npm run build` が通る状態にする

完了条件:

- 黒背景のcanvasが全画面に表示される
- `main.ts` は薄い
- ディレクトリ構成が仕様通り
- build成功

### Phase 2: WebGL renderer と短冊パネル

目的: 作品の器を作る。

作業:

- fullscreen triangle
- shader compile/link
- error overlay
- resize / DPR / renderScale
- `panelUv`
- パネル外の暗闇
- 仮のグラデーション表示

完了条件:

- 中央に縦長パネルが出る
- パネル内UVが正しく見える
- 画面リサイズで崩れない
- `renderScale` が効く

### Phase 3: 渦物理

目的: 黒穴を作品の主体として成立させる。

作業:

- `Vortex` 型
- 3つの初期配置
- 壁反射
- 速度制限
- 接近時の押し合い
- 圧力蓄積
- swap
- shaderへ uniform 送信
- 仮描画として黒円 + リング + influence範囲を表示

完了条件:

- 3つの黒穴が安定して漂う
- 画面外へ逃げない
- 近づくと押し合う
- 圧力解放で位置交換する
- 物理だけを読んでも理解できる

### Phase 4: 素材シェーダMVP

目的: 作品らしい背景を作る。

作業:

- noise / fbm / voronoi
- liquid material
- cellular material
- universe material
- pale mineral material
- petal vein material
- palette
- vortex lens warp
- lighting / specular

完了条件:

- 少なくとも4状態が写真の方向性に対応している
- 黒穴周辺で素材が歪む
- 全面ノイズではなく、膜・流れ・構造が見える
- 過剰に白飛び/黒潰れしない

### Phase 5: LED / 発光 / 物体感

目的: 「画面内CG」から「展示物のLED面」へ寄せる。

作業:

- LED dot mask
- grid line
- scanline
- 微小輝度むら
- fireflies
- glow
- vignette
- 黒穴リングの光沢

完了条件:

- 写真のような表示面の粒状感が出る
- 発光点が作品に馴染む
- LED処理をOFFにしても素材確認ができる
- ONにすると展示感が増す

### Phase 6: GUI / preset / Auto

目的: 育てられる作品にする。

作業:

- settings schema
- lil-gui
- presets
- URL query
- seed
- Auto遷移
- immersive UI
- debug toggle

完了条件:

- GUI変更が即反映される
- プリセットを切り替えて破綻しない
- seed違いで同じ作品世界の別個体が出る
- 没入表示できる

### Phase 7: 仕上げ / GitHub Pages

目的: 公開・検証できる形にする。

作業:

- README
- docs整理
- GitHub Pages workflow
- パフォーマンス調整
- スクリーンショット比較
- 既知の限界を書く

完了条件:

- `npm run build` 成功
- GitHub Pagesで表示
- READMEに実行方法と操作説明
- 仕様書と実装が大きく乖離していない

---

## 9. コーディングエージェント用ルール

### 9.1 基本ルール

コーディングエージェントには、必ず以下を守らせる。

- 一度に1フェーズだけ作業する
- 仕様書にない大きな機能を追加しない
- `src/main.ts` を巨大化させない
- shader、physics、GUIを同じ指示で大改造しない
- 完了時に変更ファイル一覧、実装内容、未完了、確認方法を書く
- 最後に `npm run build` を実行する

### 9.2 禁止事項

- とりあえず全部 `main.ts` に入れる
- 既存の責務分離を壊す
- パラメータを説明なしに増やす
- `settings` と `uniform` の対応を曖昧にする
- エラーを握りつぶす
- 見た目を確認できないまま大量変更する
- 「それっぽい」だけで受け入れ条件を満たさない

### 9.3 最初のプロンプト案

```text
新規Vite + TypeScript + WebGL2アプリとして、手弁当蒼氓蟲譜 二号機の土台を作ってください。

目的:
- src/main.tsを薄いbootstrapにする
- renderer / simulation / settings / controls / shaders / presets の責務分離を作る
- まずは黒背景canvasと中央の縦長パネルだけを表示する
- WebGL2 fullscreen triangleで描画する
- npm run build が通る状態にする

禁止:
- shaderを巨大化させない
- 渦物理や素材シェーダはまだ実装しない
- main.tsにWebGL詳細を直書きしない

完了時:
- 変更ファイル一覧
- 実装した責務
- npm run build結果
- 次フェーズでやること
を報告してください。
```

### 9.4 Phase 3用プロンプト案

```text
Phase 3として、渦物理だけを実装してください。

要件:
- Vortex型を定義
- 3つの渦がパネルUV空間で漂う
- 壁反射する
- 速度制限する
- 接近時に押し合う
- pressureが溜まるとswapする
- shaderには position, velocity, radius, pressure をuniformで渡す
- 見た目は仮でよいので黒円、リング、影響範囲を描画する

禁止:
- 背景素材シェーダを複雑化しない
- GUI項目を増やしすぎない
- main.tsに物理を直書きしない

完了条件:
- 3つの黒穴が安定して動く
- npm run buildが通る
- デバッグ表示で半径と影響範囲を確認できる
```

### 9.5 Phase 4用プロンプト案

```text
Phase 4として、素材シェーダMVPを実装してください。

要件:
- Liquid, Cellular, PaleMineral, DeepBlueUniverse, PetalVein の5素材を作る
- 各素材は関数として分離する
- colorModeとmaterialModeを分離する
- 黒穴のlensWarpで背景素材を歪ませる
- LED処理はまだ軽くてよい
- 全面ノイズではなく、膜・流れ・輪郭・奥行きが見えるようにする

禁止:
- 既存のrenderer / simulation / settings構造を壊さない
- 素材を1つの巨大if文だけで実装しない
- プリセットを未定義のままGUIに出さない

完了条件:
- GUIで素材を切り替えられる
- 5素材が明確に違う
- 黒穴周辺で素材が歪む
- npm run buildが通る
```

---

## 10. MVP完了判定

二号機MVPは、以下を満たしたら「完成」とする。

### 視覚面

- 暗闇に短冊状LED作品として浮かぶ
- 3つの黒穴が明確に作品の主役になっている
- 黒穴周囲にリング、歪み、吸い込み感がある
- 白系、青系、マゼンタ/緑系、青紫/花弁系の4方向が出せる
- LED面の粒状感がある
- 発光粒がある
- 1分見ていても単調に見えない

### 実装面

- `npm run build` が通る
- `src/main.ts` が薄い
- 物理が `simulation` に分離されている
- settings が型定義されている
- shader が最低限チャンク化されている
- preset が定数として管理されている
- READMEとdocsがある

### 操作面

- GUIで主要パラメータを調整できる
- プリセットが切り替えられる
- 全画面/没入モードにできる
- URLでpreset/seedを指定できる
- 低負荷化のためrenderScaleを下げられる

---

## 11. 仕様上の未決事項

次に壁打ちで決めるべきこと。

1. 二号機は「本家の再現度」を最優先するか、「私の蒼氓蟲譜」として作品化するか
2. texture asset なしで行くか、参照写真/動画から抽出した素材を一部テクスチャとして使うか
3. 黒穴は常に3つ固定か、将来個数を変えられるようにするか
4. Bloom / Petal 系は白黒線画寄りにするか、液体・膜と混ぜるか
5. 一旦MacBook全画面用に最適化するか、スマホ/縦長LED実機も意識するか
6. 公開時に「非公式習作 / inspired by」と明記するか

---

## 12. 次の会話で決めること

最初に決めるべき分岐はこれ。

**二号機の主目的は A / B / C のどれか。**

A. 本家写真に近い瞬間を出す再現機  
B. 本家構造を借りた「私の蒼氓蟲譜」生成機  
C. 展示・投稿・共有まで見据えた作品制作ツール

おすすめは B。  
Aだけだと局所的な模倣に寄りすぎて、またshaderのつぎはぎになりやすい。Cは魅力的だが、MVPが膨らむ。Bとして作り、後からCへ伸ばすのが一番きれい。
