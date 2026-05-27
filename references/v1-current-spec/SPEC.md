# Digital Nature Liquid Universe / Viscous LED Vortex Art 仕様書

このドキュメントは、現行リポジトリを別実装へリメイクするための仕様整理です。実装の再現に必要な画面、描画、状態、操作、依存関係、主要アルゴリズムを、現行コードから読み取れる範囲で詳細化しています。

## 1. 概要

本アプリは、縦長LED作品風の抽象ビジュアルを WebGL2 fragment shader でリアルタイム生成する Vite + TypeScript アプリである。

中心となる体験は以下。

- 黒い3つの渦 / 穴が、縦長パネル内をゆっくり漂う。
- 渦周辺では背景の液体・細胞・油膜・宇宙・花・雲などの模様が重力レンズ風に歪む。
- 渦同士が近づくと、一定時間押し合って圧力を溜めたあと、高速で互いの位置を入れ替える。
- 背景は極彩色の高粘度流体、細胞膜、黒い油膜、発光粒、LEDグリッドを合成した抽象映像。
- 右上の lil-gui で、色、動き、質感、ベース素材、LED強度などをリアルタイム調整できる。
- 右下に UI 表示切替と没入モード切替ボタンがある。

## 2. 技術スタック

- ランタイム: ブラウザ
- ビルドツール: Vite 6
- 言語: TypeScript 5
- 描画: WebGL2
- UI: lil-gui
- 追加ツール: Swift製の動画フレーム抽出スクリプト

package scripts:

- `npm run dev`: Vite 開発サーバー起動
- `npm run build`: `tsc` の型チェック後に Vite build
- `npm run preview`: Vite preview

依存関係:

- runtime dependency: `lil-gui`
- dev dependencies: `typescript`, `vite`

## 3. ファイル構成

### 3.1 リポジトリツリー

現行リポジトリのルートは `goal-macbook-web-led-3-led/`。親ディレクトリにも `package-lock.json` があるが、このアプリの実体と `.git` は `goal-macbook-web-led-3-led/` 配下にある。

```text
goal-macbook-web-led-3-led/
├── .git/                         # Git管理ディレクトリ
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Pages 自動デプロイ
├── .gitignore                    # node_modules, dist, .DS_Store, *.log を除外
├── .README.md                    # バイナリ混じりの一時ファイル候補。リメイク対象外
├── README.md                     # 現行の簡易説明・実行方法・GUI項目
├── SPEC.md                       # 本仕様書
├── index.html                    # HTMLエントリ。canvasとmain.tsを読み込む
├── package-lock.json             # npm lockfile
├── package.json                  # npm scripts / dependencies
├── src/
│   ├── main.ts                   # WebGL2アプリ本体、shader、状態、GUI
│   └── style.css                 # 全画面canvas、GUI、右下UIのCSS
├── tools/
│   └── extract_video_frames.swift # 動画フレーム抽出用補助ツール
├── tsconfig.json                 # TypeScript設定
└── vite.config.ts                # Vite設定。GitHub Pages baseを環境で切替
```

生成物・依存物:

```text
node_modules/                     # npm installで生成。gitignore対象
dist/                             # npm run buildで生成。gitignore対象
```

### 3.2 ファイル別責務

- `index.html`
  - 日本語HTML。
  - `<canvas id="gl"></canvas>` を配置。
  - `/src/main.ts` を module script として読み込む。
  - title は `Digital Nature Liquid Universe`。
  - viewport は `viewport-fit=cover` 付きでモバイルのsafe areaを考慮。
  - body内にはcanvas以外の静的UIを持たない。GUIとボタンは `src/main.ts` が動的生成する。

- `src/main.ts`
  - アプリ本体。
  - vertex shader / fragment shader を文字列として内包。
  - WebGL2初期化、shader compile/link、uniform取得、描画ループ、渦物理、GUI、没入モードをすべて担当。
  - shaderコード、物理シミュレーション、DOM UI生成が同居しているため、リメイク時は以下のような分割候補がある。
    - `shaderSources`: vertex / fragment shader
    - `renderer`: WebGL初期化、program、uniform、resize、draw
    - `vortexPhysics`: 3渦の移動、壁反射、圧力、swap
    - `settings`: GUI設定、Auto遷移、mode変換
    - `controls`: lil-gui、右下ボタン、fullscreen

- `src/style.css`
  - 画面全体の黒背景。
  - canvasをviewport全面固定表示。
  - lil-guiの見た目と配置。
  - 右下ボタンUIの見た目。
  - `body.is-immersive` 時は lil-gui を非表示。

- `tools/extract_video_frames.swift`
  - 動画から複数時刻のJPEGフレームを抽出する補助ツール。
  - AVFoundation / AppKit を使用。

- `vite.config.ts`
  - Viteのbase pathだけを設定する小さな設定ファイル。
  - GitHub Actions上では `GITHUB_REPOSITORY` から repo 名を取り出し、`/<repo>/` をbaseにする。
  - ローカルでは `/`。

- `tsconfig.json`
  - `strict: true`
  - `noEmit: true`
  - `moduleResolution: Bundler`
  - `include: ["src"]`
  - 型チェック対象は `src` のみ。`tools` のSwiftや設定ファイルはTS型チェック対象外。

- `.github/workflows/deploy.yml`
  - main branchへのpush、または手動実行で発火。
  - Node.js 20 を使用。
  - `npm ci` → `npm run build` → `dist` をGitHub Pages artifactとしてupload。
  - deploy jobで `actions/deploy-pages@v4` を実行。

- `.README.md`
  - 内容は通常のMarkdownではなく、Vim情報を含むバイナリ混じりのファイルに見える。
  - READMEの過去内容断片も含まれているが、正式ドキュメントとして扱わない。
  - リメイク時は削除候補。ただし現状では未追跡ファイルなので、削除する場合は所有者確認を推奨。

### 3.3 `src/main.ts` 内部構造

現行ファイルは約2000行で、責務が1ファイルに集中している。リメイク時に参照しやすいよう、概念上のブロックを整理する。

```text
src/main.ts
├── imports / type定義
│   ├── lil-gui import
│   ├── style.css import
│   └── Vortex type
├── shader source
│   ├── vertexSource
│   └── fragmentSource
│       ├── uniforms
│       ├── hash/noise/fbm/curl utilities
│       ├── natural fields: star, branch, bloom, cloud
│       ├── bloom decorative helpers
│       ├── warpedVoronoi
│       ├── palette / contrastAccent / analogPalette
│       ├── naturalBaseColor
│       ├── panelUv
│       └── main fragment composition
├── DOM/WebGL setup
│   ├── canvas取得
│   ├── WebGL2 context作成
│   ├── shader compile/link
│   ├── program / VAO bind
│   └── uniform location取得
├── runtime state
│   ├── settings
│   ├── URL query base反映
│   ├── window.__digitalNature
│   ├── vortices
│   ├── uniform送信用TypedArray
│   └── flow/color/surface mix値
├── physics / math helpers
│   ├── pairIndex
│   ├── boundsFor
│   ├── wallPressure
│   ├── updateVortices
│   ├── noiseLike
│   └── smoothstep
├── renderer helpers
│   ├── resize
│   ├── mainColorValue
│   ├── baseModeValue
│   ├── autoValue
│   ├── colorStyleTarget
│   ├── surfaceTarget
│   ├── stretchTarget
│   ├── boilTarget
│   ├── motionValue
│   └── updateFlowMix
├── animation loop
│   └── frame(now)
└── UI setup
    ├── lil-gui controllers
    ├── base/warpEffect相互制約
    ├── right-bottom app-ui
    ├── settings toggle
    ├── immersive/fullscreen toggle
    └── resize listeners / requestAnimationFrame開始
```

### 3.4 デプロイ・ブランチ状況

現行のGit状態確認時点:

- branch: `liquid-universe-remake`
- `.github/workflows/deploy.yml` は `main` branch push でGitHub Pagesへデプロイする設定。
- ローカル作業ツリーには、既存の変更として `index.html`, `src/main.ts`, `src/style.css` の変更がある。
- `SPEC.md` は今回追加した仕様書。
- `.README.md` は未追跡の一時ファイル候補。

リメイク時の注意:

- deploy workflowは `main` push前提なので、リメイクブランチで動作確認後にmainへmergeする想定。
- GitHub Pages配信ではbase pathが `/<repo>/` になる。ルート相対パスやasset参照を追加する場合はViteのbase設定に従うこと。
- 静的assetを追加する場合は、Viteの通常ルールに従い `public/` または `src` import 管理へ整理するのがよい。

## 4. 画面仕様

### 4.1 表示レイアウト

画面は canvas 1枚で構成される。canvas は常に viewport 全体を覆う。

CSS要件:

- `html`, `body`
  - width / height: 100%
  - margin: 0
  - overflow: hidden
  - background: black

- `canvas`
  - fixed position
  - `inset: 0`
  - `width: 100vw`
  - `height: 100vh` と `100dvh`
  - `touch-action: none`

### 4.2 縦長LEDパネル

shader内の `panelUv()` により、実際の絵は縦長パネルとして中央に配置される。

- 現行描画ループでは `u_displayMode = 1` に固定。
- `u_displayMode == 1` のとき、縦長パネルの目標アスペクト比は `0.265`。
- パネル高さは基本的に画面高さの `0.92`。
- パネル幅が大きくなりすぎる場合は最大 `0.54` に制限し、高さを再計算する。
- パネル外は暗い宇宙的な黒背景と軽いビネット。
- パネル端には `edge` 値が計算されるが、現行では強い枠線描画には使われていない。

### 4.3 GUI

右上に lil-gui を表示する。

- タイトル: `Digital Nature`
- 背景: 半透明の黒
- blur: `backdrop-filter: blur(12px)`
- safe area を考慮して右上配置
- 高さは `100dvh` に収まるようにし、overflow auto

小画面または coarse pointer では初期状態でGUI非表示。

### 4.4 右下UI

右下に2つのボタンを表示する。

- Settings / Hide UI
  - GUIの表示・非表示を切り替える。
- Immersive / Exit
  - 没入モードを切り替える。
  - 没入モードON時は `document.documentElement.requestFullscreen()` を試みる。
  - フルスクリーン解除を検知した場合は没入モードもOFFに戻す。

`body.is-immersive` 時は lil-gui が強制非表示。

## 5. WebGL初期化仕様

canvas取得:

- selector: `#gl`
- 見つからない場合は例外。

WebGL2 context options:

- `antialias: false`
- `alpha: false`
- `depth: false`
- `stencil: false`
- `powerPreference: 'high-performance'`

WebGL2非対応時は例外。

shader compile/link失敗時:

- console error に出力。
- 画面上に赤黒背景の `<pre>` を固定表示し、エラーメッセージを表示。
- その後例外を再throw。

描画形状:

- vertex shader は `gl_VertexID` を使った fullscreen triangle。
- vertex buffer は不要。
- VAO を1つ作成して bind。
- `gl.drawArrays(gl.TRIANGLES, 0, 3)` で毎フレーム描画。

## 5.5 起動ライフサイクル

ブラウザでページを開いてから描画が始まるまでの流れ。

```text
index.html load
  ↓
/src/main.ts module実行
  ↓
style.css import
  ↓
#gl canvas取得
  ↓
WebGL2 context作成
  ↓
vertex / fragment shader compile
  ↓
program link
  ↓
program use + VAO bind
  ↓
uniform location取得
  ↓
settings初期化
  ↓
URLSearchParamsで ?base=... を反映
  ↓
vortices / TypedArray / mix状態を初期化
  ↓
lil-gui生成
  ↓
右下 app-ui ボタン生成
  ↓
画面サイズ条件によりGUI初期表示を調整
  ↓
resize / fullscreen / visualViewport listeners登録
  ↓
requestAnimationFrame(frame)
```

毎フレームの流れ。

```text
frame(now)
  ↓
dt計算
  ↓
resize()
  ↓
updateFlowMix(dt)
  ↓
updateVortices(dt)
  ↓
vorticesからpositions/velocities/radii/spins TypedArrayへ詰め替え
  ↓
uniform更新
  ↓
drawArrays(TRIANGLES, 0, 3)
  ↓
requestAnimationFrame(frame)
```

リメイク時の実装順序としては、まず fullscreen triangle と固定色描画を作り、次に `panelUv`、次に `settings` とGUI、最後に渦物理とshader合成を足すと検証しやすい。

## 6. 解像度仕様

`resize()` は毎フレーム呼ばれる。

- DPRは `Math.min(window.devicePixelRatio || 1, 2)` に制限。
- canvas width = `innerWidth * dpr * settings.renderScale`
- canvas height = `innerHeight * dpr * settings.renderScale`
- 最小サイズは 1px。
- サイズが変わった場合のみ canvas の width / height を更新。
- viewport は canvas の実ピクセルサイズに合わせる。

リサイズイベント:

- `window.resize`
- `window.visualViewport.resize`
- `window.visualViewport.scroll`

## 6.5 座標系

主な座標系:

- DOM / screen
  - `window.innerWidth`, `window.innerHeight`。
  - canvasのCSS表示サイズはviewportいっぱい。

- canvas pixel
  - `canvas.width`, `canvas.height`。
  - DPRと `renderScale` を掛けた実描画解像度。
  - `u_resolution` としてshaderへ渡す。

- `fragUv`
  - `gl_FragCoord.xy / u_resolution`。
  - 画面全体で 0.0 - 1.0。

- `uv`
  - `panelUv(fragUv)` の戻り値。
  - displayMode 1では縦長パネル内を 0.0 - 1.0 に正規化した座標。
  - パネル外は `inside < 0.5` になり、暗い背景だけを描く。

- visual metric
  - x方向に `visualAspect` を掛けた距離空間。
  - 縦長パネルでは `visualAspect = 0.265`。
  - 渦の円形見えや距離判定に使用。

- physics metric
  - TypeScript側の渦物理用距離空間。
  - x方向に `physicsAspect = 0.265` を掛ける。
  - shaderの縦長パネル見えと物理の接近判定を揃える意図。

## 7. 設定パラメータ

初期値:

| 設定 | 初期値 | 役割 |
| --- | --- | --- |
| `renderScale` | `0.85` | 描画解像度倍率 |
| `speed` | `1` | 時間進行と渦物理の速度 |
| `vortexStrength` | `7` | 黒い渦周辺のレンズ歪み強度 |
| `burst` | `12.5` | 渦同士の高速スワップの鋭さ |
| `storedPressure` | `0.24` | スワップ前に圧力が溜まる速度 |
| `ledGrid` | `0.28` | LED/ハーフトーングリッド強度 |
| `glow` | `1.28` | 発光粒・マイクログロー強度 |
| `fireflies` | `true` | 発光粒の有効/無効 |
| `mainColor` | `Auto` | メインカラーパレット |
| `colorStyle` | `Auto` | Contrast / Analog black oil の混合 |
| `surface` | `Auto` | Liquid / Skin の混合 |
| `motion` | `Auto` | 背景流体の動き |
| `base` | `Auto` | 背景素材 |
| `warpEffect` | `Auto` | 歪み方式 |
| `stretchMode` | `Auto` | ベース模様の引き伸ばし |
| `boil` | `Auto` | 細胞膜の沸騰/押し上げ表現 |

GUI範囲:

| GUI名 | 対応設定 | 範囲/候補 |
| --- | --- | --- |
| `renderScale` | `renderScale` | 0.35 - 2.5, step 0.05 |
| `speed` | `speed` | 0.05 - 5.0, step 0.01 |
| `vortex strength` | `vortexStrength` | 0.1 - 8.0, step 0.01 |
| `burst` | `burst` | 0 - 100, step 0.5 |
| `stored pressure` | `storedPressure` | 0.1 - 5.0, step 0.01 |
| `main color` | `mainColor` | Auto, Blue, Red, Green, Yellow, White, Pink, Purple |
| `color style` | `colorStyle` | Auto, Contrast, Analog + black oil |
| `surface` | `surface` | Auto, Liquid, Skin |
| `motion` | `motion` | Auto, Calm, Uni flow, Surge |
| `warp effect` | `warpEffect` | Auto, None, Curl, Layu |
| `base` | `base` | Auto, Plain, Cellular, Uneven Cellular, Bloom, Forest, Cloud, Universe |
| `stretch` | `stretchMode` | Auto, None, Low, Mid, High |
| `boil` | `boil` | Auto, Off, On |
| `fireflies` | `fireflies` | boolean |
| `LED grid` | `ledGrid` | 0 - 3, step 0.01 |

URL query:

- `?base=...` で初期 base を指定可能。
- 許可値: `Auto`, `Plain`, `Cellular`, `Uneven Cellular`, `Bloom`, `Forest`, `Cloud`, `Universe`

グローバルAPI:

- `window.__digitalNature.setBase(base: string)`
  - `settings.base` を変更し、GUI表示も更新する。

## 8. GUI連動制約

`base` と `warpEffect` には制約がある。

- base が `Cellular`, `Uneven Cellular`, `Bloom`, `Forest`, `Cloud`, `Universe` のいずれかに変更された場合:
  - `warpEffect` が `None` 以外なら `None` に強制変更。

- base が上記のいずれかの状態で `warpEffect` を `None` 以外へ変更しようとした場合:
  - `warpEffect` は `None` に戻される。

目的:

- Cellular系や自然ベースでは、シェーダ内で専用ドメインが使われるため、追加の Layu / Curl が過剰に干渉しないようにする。

## 9. 渦オブジェクト仕様

渦は3つ固定。

型:

```ts
type Vortex = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  spin: number;
  swap?: {
    cx: number;
    cy: number;
    orbitX: number;
    orbitY: number;
    startAngle: number;
    direction: number;
    elapsed: number;
    duration: number;
  };
};
```

初期値:

| index | x | y | vx | vy | radius | spin |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | 0.60 | 0.78 | 0.026 | -0.018 | 0.058 | 1.0 |
| 1 | 0.43 | 0.50 | -0.025 | 0.020 | 0.054 | -1.0 |
| 2 | 0.56 | 0.22 | 0.022 | 0.019 | 0.056 | 1.0 |

渦のホーム座標配列も定義されているが、現行実装では復帰力としては使われていない。

- `vortexHomeY = [0.78, 0.50, 0.22]`
- `vortexHomeX = [0.60, 0.43, 0.56]`

## 10. 渦物理仕様

### 10.1 時間ステップ

`updateVortices(dt)`:

- `step = min(dt, 0.033) * settings.speed`
- 物理上のアスペクト比は `0.265`。
- pair swap cooldown と pair pressure は毎フレーム減衰。
  - cooldown: `max(0, current - step)`
  - pressure: `max(0, current - step * 0.38)`

### 10.2 通常移動

swap中でない渦は以下で漂う。

- `performance.now()` ベースの周期ノイズで targetSpeed を変化。
- targetSpeed = `0.030 + 0.040 * speedDrift`
- 現在速度の角度を少しランダムに変化。
- 速度は targetSpeed へ 2.5% ずつ近づく。
- 位置に `vx * step`, `vy * step` を加算。

### 10.3 壁との衝突

`boundsFor(vortex)`:

- `marginX = max(radius * 3.2, 0.20)`
- `marginY = max(radius * 2.0, 0.075)`

境界外に出た場合:

- 座標を境界内に clamp。
- 対応する速度成分を `-0.86` 倍して反射。

### 10.4 速度制限

各フレーム末尾で速度を制限。

- minSpeed: `0.022`
- maxSpeed: `0.074`
- 速度がほぼ0でなければ方向を保って clamp。

### 10.5 渦同士の圧力とスワップ

3ペア分の状態:

- `pairSwapCooldowns = [0, 0, 0]`
- `pairPressures = [0, 0, 0]`

pair index:

- 0: pair 0-1
- 1: pair 0-2
- 2: pair 1-2

距離計算:

- x方向は `physicsAspect = 0.265` を掛けた metric 空間で計算。
- `dist = hypot(dx * 0.265, dy)`

閾値:

- `r = max(a.radius, b.radius)`
- `squeezeDist = r * 1.92`
- `swapDist = r * 1.34`

`dist >= squeezeDist` の場合は相互作用なし。

圧力:

- overlap = `squeezeDist - dist`
- pressureBase = `overlap / (squeezeDist - swapDist)`
- confinementPressure は以下の最大:
  - 2渦それぞれの壁圧
  - 第3渦が近いことによる混雑圧
- pressureRate = `(0.82 + confinementPressure * 3.6) * settings.storedPressure`
- pairPressure += `pressureBase * pressureRate * step`
- 最大 `4.0`

swap条件:

- storedPressure > `2.15`
- pair cooldown が 0 以下
- 両渦が swap 中でない

swap動作:

- 2渦の中点を中心に楕円軌道を作る。
- 軌道半径は現在距離または pressure / burst 由来の clearance の大きい方。
- direction は相対速度の cross sign で決める。
- `burst` と pressure release が大きいほど swap duration は短くなる。
- duration = `0.52 * pow(1 - releaseEase, 1.9) + 0.018`
- swap完了時、互いに半周した位置へ移動し、`swap` を解除。
- swap後:
  - pair pressure は 0
  - pair cooldown は `0.72`

swap条件未満の接近時:

- overlap に応じて2渦を互いに押し戻す。
- squeeze = `overlap * (0.028 + min(storedPressure, 1.0) * 0.018)`

## 11. uniform 仕様

毎フレーム送信される uniform:

| uniform | 型 | 内容 |
| --- | --- | --- |
| `u_resolution` | `vec2` | canvas実ピクセル幅/高さ |
| `u_time` | `float` | `now / 1000` |
| `u_vortexPos[3]` | `vec2[]` | 渦座標 |
| `u_vortexVel[3]` | `vec2[]` | 渦速度 |
| `u_vortexRadius[3]` | `float[]` | 渦半径 |
| `u_vortexSpin[3]` | `float[]` | 渦回転方向。現行shaderでは大きく使われていない |
| `u_speed` | `float` | GUI speed |
| `u_vortexStrength` | `float` | GUI vortexStrength |
| `u_ledStrength` | `float` | GUI ledGrid |
| `u_glow` | `float` | GUI glow |
| `u_displayMode` | `int` | 現行は常に 1 |
| `u_colorMode` | `int` | mainColor の数値化 |
| `u_colorStyleMix` | `float` | Analog black oil 寄り度 |
| `u_flowMix` | `vec4` | Calm, Uni flow, Cellular, Surge の混合 |
| `u_layuMix` | `float` | Layu warp混合 |
| `u_cellBoilMix` | `float` | Boil混合 |
| `u_cellStretchMix` | `float` | Stretch混合 |
| `u_curlMix` | `float` | Curl混合 |
| `u_skinMix` | `float` | Skin質感混合 |
| `u_unevenCellMix` | `float` | Uneven Cellular混合 |
| `u_fireflyEnabled` | `float` | fireflies trueなら1 |
| `u_baseMode` | `int` | base の数値化 |

## 12. モード数値化

### 12.1 mainColor

| 値 | mode |
| --- | --- |
| 0 | Auto |
| 1 | Blue |
| 2 | Red |
| 3 | Green |
| 4 | Yellow |
| 5 | White |
| 6 | Pink |
| 7 | Purple |

### 12.2 baseMode

| 値 | mode |
| --- | --- |
| 0 | Auto / Plain |
| 1 | Cellular |
| 2 | Uneven Cellular |
| 3 | Bloom |
| 4 | Forest |
| 5 | Cloud |
| 6 | Universe |

注意:

- `baseMode == 2` は `u_unevenCellMix` で不均一性を追加するが、shader上の自然ベース分岐では `bloom/forest/cloud/universe` のような特別早期returnには入らない。

### 12.3 motion

`u_flowMix` の対応:

- x: Calm
- y: Uni flow
- z: Cellular
- w: Surge

`motionValue()`:

- Auto: 0
- Calm: 1
- Uni flow: 2
- Surge: 4

## 13. Auto遷移仕様

Auto系は `autoValue(seed, seconds)` を使い、34秒単位の epoch 間を smoothstep 補間する。

```ts
epoch = floor(seconds / 34)
phase = seconds / 34 - epoch
a = noiseLike(seed, epoch)
b = noiseLike(seed, epoch + 1)
value = mix(a, b, smoothstep(0.15, 0.88, phase))
```

各ターゲット:

- colorStyle Auto
  - `smoothstep(0.36, 0.68, autoValue(21.7, seconds))`
  - 0がContrast、1がAnalog + black oil

- surface Auto
  - `smoothstep(0.46, 0.76, autoValue(36.8, seconds + 13))`
  - 0がLiquid、1がSkin

- stretch Auto
  - `smoothstep(0.42, 0.84, autoValue(72.3, seconds + 5)) * 0.58`

- boil Auto
  - slow と burst の2系統の autoValue を合成。
  - cellularAmount が一定以上あるときだけ発火。

`updateFlowMix(dt)` は各mix値を指数補間する。

- 補間係数: `k = 1 - exp(-dt * 0.38)`
- 遷移はかなりゆっくり。

## 14. shader構成

fragment shader は大きく以下で構成される。

### 14.1 基本関数

- `hash12(vec2)`: 疑似乱数。
- `noise(vec2)`: value noise。
- `fbm(vec2)`: 4 octave の fractal noise。
- `curlField(vec2)`: fbm差分からcurl方向を作る。
- `rotate2(vec2, float)`: 2D回転。

### 14.2 自然・装飾フィールド

- `starField`
  - 細かい星と大きめの星を格子ごとに生成。
  - Universe / space系で使用。

- `branchField`
  - 中央軸と左右の葉脈状ライン。
  - Forest系で使用。

- `bloomField`
  - 6箇所の花/ペタル状の有機形状。

- `cloudField`
  - broad / billow noise による雲のベール。

- `bloomDomain`
  - Bloomの花単位に近い中心を選び、極座標的なドメインへ変換。

- `forestDomain`
  - 葉脈方向に沿った流れのあるドメインへ変換。

- `bloomDecorativeFlower`
  - 4枚花弁、中心、枝状の葉脈、インク、膜、青いwashを生成。

- `bloomHydrangeaPattern`
  - 10個の装飾花を合成する関数。
  - 現行 main path では直接使われていない可能性がある。

- `bloomPetalBoundaryStudy`
  - 花弁の黒線アウトラインの研究表示。
  - `baseMode == 3` の `naturalBaseColor` で早期returnするため、Bloom base は現在この白黒線画寄りの見え方になる。

### 14.3 Voronoi / 細胞膜

- `warpedVoronoi`
  - 近傍3x3セルを探索。
  - jitter、回転、サイズ歪み、時間揺れを加えたVoronoi。
  - 出力:
    - `membrane`: セル境界
    - `fill`: セル内部
    - `ribs`: 内部リブ
    - `idValue`: セルID由来の乱数
  - `u_unevenCellMix` が高いほどセルサイズの不均一性が強くなる。

### 14.4 パレット

- `palette(t, mode, time)`
  - mode別の主パレット。
  - Autoは vivid 極彩色。
  - Blue / Red / Green / Yellow / White / Pink / Purple をサポート。

- `contrastAccent(t, mode)`
  - 選択色に対する補色・差し色。
  - Contrast styleで混入。

- `analogPalette(t, mode)`
  - 同系色中心の抑制されたパレット。
  - Analog + black oil styleで使用。

### 14.5 naturalBaseColor

`u_baseMode` に応じて、自然系ベースを直接返す。

- mode 3 Bloom:
  - `bloomPetalBoundaryStudy` を返す。
  - main shaderではこの場合、そのまま `outColor` して早期return。

- mode 4 Forest:
  - 葉状のbody、branchField、淡い青緑のleaf色。

- mode 5 Cloud:
  - cloudField による雲。

- mode 6 Universe:
  - space noise + starField + vivid palette。

### 14.6 メイン描画分岐

`main()` の流れ:

1. frag座標を `fragUv` に変換。
2. `panelUv` で縦長パネルUVに変換。
3. パネル外なら暗い背景を描いてreturn。
4. base が Bloom/Forest/Cloud/Universe なら natural branch。
   - Bloomは白黒花弁境界を直接描画してreturn。
   - Forest/Cloud/Universeは黒渦、リング、LED texture、ビネットを重ねてreturn。
5. それ以外は液体/細胞/油膜系のフル合成へ進む。

## 15. 液体/細胞/油膜レンダリング仕様

フル合成では以下を順に作る。

### 15.1 黒穴レンズ

各渦について:

- `coreMetric = vec2((uv.x - vortex.x) * visualAspect, uv.y - vortex.y)`
- 距離と半径から influence / mass / horizonFade / flip を計算。
- `u_vortexStrength` に応じて `lensWarp` を蓄積。
- 黒中心:
  - `blackCore = 1 - smoothstep(r * 0.36, r * 0.43, coreDist)`
- inner ink:
  - `1 - smoothstep(r * 0.20, r * 0.38, coreDist)`
- 実際の黒塗りは最後のほうで、背景が歪んだあとに適用。

### 15.2 流れモード

Auto時は時間epochごとに以下をランダム遷移。

- calmGate
- uniGate
- cellularGate
- surgeGate

手動設定や base 設定がある場合はそれを target に反映。

効果:

- Calm: flowActivity を弱める。
- Uni flow: 一方向の波/流れを強める。
- Cellular: Voronoi細胞・膜・分裂表現を強める。
- Surge: 局所的な流体パッチを強める。

### 15.3 流体ドメイン

- waveDir / wave / oilFlow / oilShear を生成。
- `flowPatch` を2つ使い、局所的なspillを加える。
- `warp` は2系統fbmで生成。
- `p = uv + lensWarp + oilFlow + oilShear + localSpill`

### 15.4 Voronoiドメイン変形

- `oilDomain`, `skinDomain` を作る。
- Skin寄りでは `skinDomain` を優先。
- `curlField` と stretch方向で座標を引き伸ばす。
- `cellStretchMix` でズーム中心へスケール。
- `cellBoilMix` で3箇所の局所パンチを追加。
- `warpedVoronoi` に渡し、膜/内部/リブ/IDを得る。

### 15.5 Boil表現

Boilは、既存Voronoiセルが下から押されて膨らむような表現。

- 渦レンズが強い場所では boil を抑制。
- セルIDとpressure fieldから pulse を作る。
- colonyBulge / boilBody / lensRise を生成。
- 境界線を壊しすぎず、細胞内部の高さと光沢として出す。
- splitSeam により細胞分裂のような線を追加。

### 15.6 色合成

主要な色レイヤー:

- 主パレット色 `col`
- 下地 `under`
- cellColor
- accentColor
- divisionBase
- vorCellColor
- boilBodyColor
- skinTint
- tubeColor

主な合成要素:

- `colorStyleMix`
  - 0: Contrast寄り
  - 1: Analog + black oil寄り
- `blackPuddle`
  - 黒い油膜/暗い水たまり。
- `darkChannel`
  - 黒緑の太い流路や影。
- `membrane`, `boundary`
  - 細胞膜境界。
- `whiteGel`
  - 白いゲル/膜のハイライト。
- `vesselLine`, `pores`
  - Skin系の血管/小孔表現。

最終色は:

- gamma調整
- contrast/saturation強化
- mood tint
- pearl mode補正
- specular highlight
- firefly glow
- vortex black mask
- LED grid
- vignette

を経て出力される。

## 16. LEDグリッド仕様

液体系 branch:

- `ledAmount = min(u_ledStrength, 0.72)`
- grid座標: `uv * vec2(180.0, 320.0)`
- cell内距離から dotMask を生成。
- cell境界から gridLine を生成。
- scanline: `0.965 + 0.035 * sin(uv.y * 1600.0)`
- 色への適用:
  - dot部分をわずかに明るくする。
  - grid lineを暗くする。
  - scanlineを軽く掛ける。

自然ベース branch:

- `ledAmount = min(u_ledStrength, 0.56)`
- scanlineは使わず、dot/gridのみ。

## 17. 発光粒仕様

fireflies有効時:

- `uv * vec2(12.0, 32.0)` の粗いセルごとに発光候補。
- hashで少数だけ残す。
- blinkはセルseedと時間で非同期に変動。
- `glint` と `microGlow` を白～青白く加算。
- `u_glow` で強度を調整。

## 18. 光沢仕様

height field:

- cellBlob, thick, fine, membrane, layer, division, boil, bubble, voronoi, tubeなどを合成。
- Bloom/Forest/Cloud/Universeではそれぞれ専用heightへmix。

normal:

- `dFdx(height)`, `dFdy(height)` から疑似法線。
- `normal = normalize(vec3(-grad * 34.0, 1.0))`

lighting:

- lightDir = `normalize(vec3(-0.35, 0.5, 0.76))`
- 反射 specular power 62
- diffuse寄りspec power 18を少量追加

## 19. 自然ベース仕様

### 19.1 Bloom

現行挙動:

- `baseMode == 3` の場合、自然ベース分岐に入り `bloomPetalBoundaryStudy` を描画して即return。
- そのため、他モードのような液体合成・渦リング合成は基本的に乗らない。
- 見た目は白地に黒い花弁アウトラインの研究表示に近い。

注意:

- fragment shader内には `bloomHydrangeaPattern` や bloomTint 合成も存在するが、現行の早期returnにより主経路では到達しない。リメイク時に「花 + 液体 + 渦」を期待するなら、ここは仕様再検討ポイント。

### 19.2 Forest

- 淡い青緑の葉/膜。
- branchField による中央軸と側脈。
- 黒い渦中心、白灰リング、LED texture、ビネットが重なる。

### 19.3 Cloud

- 暗い青黒背景から淡い雲へ。
- 渦の視認性は低くなり、`vortexVisibility` が 0.10 へ寄る。

### 19.4 Universe

- space noise と starField。
- 渦の視認性は 0.42 程度。
- LED textureあり。

## 20. 補助Swiftツール仕様

`tools/extract_video_frames.swift`

用途:

- 入力動画から、指定時刻のフレームをJPEGとして抽出する。
- 参照素材や検証用フレームを作るための補助ツールと考えられる。

使い方:

```bash
swift tools/extract_video_frames.swift <video> <out-dir>
```

仕様:

- 出力ディレクトリは自動作成。
- `AVAssetImageGenerator` を使用。
- `appliesPreferredTrackTransform = true`
- 最大サイズ: 900 x 1600
- time tolerance before/after は `.zero`
- 抽出時刻:
  - 0.8s
  - 4.5s
  - 8.5s
  - 12.5s
  - 16.5s
  - 20.5s
  - 24.5s
- 動画長より短い時刻のみ抽出。
- JPEG compressionFactor は 0.9。
- 出力名: `frame_%02d_%.1fs.jpg`

## 21. リメイク時の再現優先度

### 必須

- 縦長LEDパネルとして中央表示されること。
- 3つの黒い渦が常時漂うこと。
- 渦周辺で背景が歪むこと。
- 渦同士が接近時に押し合い、圧力解放で高速スワップすること。
- GUIで主要パラメータをリアルタイム調整できること。
- Cellular / Liquid / Skin / Cloud / Universe など、少なくとも主要質感が切り替わること。
- LEDグリッドと発光粒の有無・強度を制御できること。
- 全画面/没入モードがあること。

### 重要

- Autoモードがゆっくりランダム遷移すること。
- Contrast と Analog + black oil の色性格が明確に違うこと。
- Boilは新しい細胞を上書きで描くのではなく、既存細胞が盛り上がるように見えること。
- Skinでは黒緑の流路・小孔・半透明膜が強くなること。
- Cloud/Universeでは渦の黒塗りが少し弱まり、背景を邪魔しすぎないこと。

### 任意/見直し候補

- Bloomの現在挙動は研究表示的な白黒アウトラインになっているため、リメイクでは完成表現として扱うか再設計するか決める。
- `u_vortexSpin` は送信されるが現行shaderで目立つ利用はないため、移植時に省略または活用を検討できる。
- `vortexHomeX/Y` は未使用に近いため、ホーム復帰挙動を追加するか削除するか検討できる。

## 22. ビルド・検証手順

ローカル実行:

```bash
npm install
npm run dev
```

ビルド検証:

```bash
npm run build
```

ブラウザ要件:

- WebGL2対応ブラウザ。
- Fullscreen API は没入モード用。非対応でもアプリ描画自体は動く。

性能調整:

- 重い場合は `renderScale` を 0.7 前後へ下げる。
- fragment shader が非常に大きいため、モバイルや低性能GPUでは compile / runtime が重い可能性がある。

## 23. 既知の実装上の特徴

- すべての描画ロジックが1つの巨大 fragment shader に入っている。
- shader source は TypeScript 文字列で直接管理。
- 描画は postprocess や framebuffer を使わず、単一pass。
- texture asset は使っていない。
- UIはDOM + lil-guiのみ。
- 状態永続化はない。
- 音声、入力操作による絵への直接干渉、保存/録画機能はない。
- テストは用意されていない。
