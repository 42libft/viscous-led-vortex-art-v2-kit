# 15. Project Closure / Liquid Universe Reuse Handoff

## 1. 結論

このプロジェクトは、蒼氓蟲譜の模倣開発としてはここで終了する。

理由は、対象がリアルタイム生成作品であり、さらに日々アルゴリズムが更新され続ける以上、どれだけ精密に再現しても「似て非なるもの」に留まるため。ここから先は再現精度ではなく、Liquid Universeという概念を自分の作品として解釈し直す。

このリポジトリは、完成品ではなく「次作へ流用する構造の凍結点」として扱う。

## 2. 次作の中心概念

次作の仮コンセプト:

```text
Liquid Universe:
固定された境界が信頼できなくなる状態としてのLiquid。
大衆のディスプレイを前提に、作品の枠そのものが変化する。
黒円はリスペクトと個人的な好みとして残す。
模様は模倣ではなく、美的判断と人工生命アルゴリズムを融合した独自のDigital Natureとして作る。
```

重要なのは、短冊型LEDの再現ではなく、ディスプレイ内の「枠」が流動化すること。枠は矩形、短冊、円、裂け目、泡、膜、複数窓、侵食された領域などへ変化してよい。

## 3. 次作へ流用するもの

### 3.1 そのまま流用しやすいもの

- `src/main.ts`
  - 薄い入口としての形。
- `src/app/`
  - 起動、frame loop、error overlay、lifecycleの考え方。
- `src/renderer/`
  - WebGL2初期化、fullscreen triangle、shader compile/link、uniform注入。
- `src/shaders/buildShader.ts`
  - common chunk + variantの組み立て方式。
- `src/settings/RandomAutoDirector.ts`
  - 固定順序ではない重み付きランダム遷移。
- `src/simulation/VortexSystem.ts`
  - 黒円の共通物理。
- `src/simulation/vortexPhysics.ts`
  - 漂い、壁反射、接近圧力、swapの挙動。
- `src/shaders/common/blackHoleField.glsl`
  - Event Horizon、Gravity Lens、周回warpの共通表現。
- `src/fireflies/` と `src/shaders/common/fireflies.glsl`
  - 白い点々をModeから分離した共通レイヤーとして扱う設計。
- `src/effects/` と `src/shaders/common/effects.glsl`
  - glow、specular、grain、scanlineを補助質感として分離する設計。
- `src/shaders/common/alife.glsl`
  - 人工生命風の変調を共通処理として薄く重ねる入口。

### 3.2 名前や前提を変えて流用するもの

- `src/display/panel.ts`
  - 次作では `LiquidFrameSystem` または `display/frame.ts` へ改名する。
  - 固定短冊ではなく、時間変化するframe mask / frame UV / frame boundsを返す責務へ拡張する。
- `src/shaders/common/panel.glsl`
  - 次作では `liquidFrame.glsl` へ改名し、矩形以外の枠を扱う。
- `src/patterns/`
  - 型とRegistry構造は流用可能。
  - `PatternOrigin = reference | original` は次作では不要。`lineage`、`ecosystem`、`era`、`family` のような作品側メタデータへ置き換える。
- `src/colors/`, `src/motion/`, `src/composition/`
  - 責務分離は継続。
  - 次作ではCompositionより上位に、枠そのものを動かす `Frame` / `Boundary` カテゴリを置く。
- `src/ui/gui.ts`
  - 調整UIとしては流用可能。
  - 制作ツール化は次作MVPでも不要なら、保存・タイムライン・録画へ広げない。

## 4. 次作へ持ち込まないもの

- 蒼氓蟲譜の再現を目的にしたReference Modeの完成目標。
- 本家写真や動画を実行時assetにする発想。
- 短冊形状を唯一の表示枠とする前提。
- `ref-*` という価値判断を含む命名。
- 旧Reference Presetの色や模様を、次作の正解として扱うこと。
- 「似ているかどうか」を評価軸にすること。
- 録画、投稿、タイムライン編集、外部入力、展示運用機能。

## 5. 次作の初期Phase案

### Phase A: Concept Lock

- Liquid Universeの一文ゴールを書く。
- Liquidを「固定境界が信頼できなくなる状態」と定義する。
- 黒円を残す理由と役割を決める。
- 模様生成に使う人工生命系の候補を3つだけ選ぶ。

### Phase B: Engine Import

- このリポジトリからWebGL2基盤、VortexSystem、BlackHoleField、FireflySystem、Effect Systemを移植する。
- `main.ts` は薄い入口のままにする。
- 旧Reference Modeは初期Auto候補に入れない。

### Phase C: LiquidFrameSystem

- `panel` を `frame` へ置き換える。
- shaderへ `frameUv`, `frameMask`, `frameEdge`, `frameId` を渡す。
- 最初は矩形から始め、次に呼吸する境界、裂ける境界、複数窓へ広げる。

### Phase D: BlackHole Recontextualize

- 黒円を「元作品へのリスペクト」ではなく、Liquid Universe内の重力的な穴として再定義する。
- 個数は3固定で始めてもよいが、型は可変数に拡張しやすくする。
- 黒円は各Patternへ埋め込まない。

### Phase E: Original Pattern Ecosystems

- Reference再現ではなく、独自Pattern familyを作る。
- 候補:
  - `membrane-life`: 反応拡散、膜、濡れた境界。
  - `swarm-cosmos`: 群知能、星雲、軌跡。
  - `mineral-organism`: 結晶、細胞壁、発光する微細構造。
- Pattern / Color / Move / Firefly / Effectは分離したままにする。

### Phase F: Auto as Ecological Drift

- Autoは固定順序ではなく、重み付きランダムを維持する。
- Preset切替だけでなく、Frame state、Pattern ecosystem、Color climate、Move intensityをゆっくり遷移させる。

## 6. パッケージ作成

次作へ渡すローカルtarballは次で作る。

```sh
./handoff/create-liquid-universe-package.sh
```

生成物:

```text
handoff/artifacts/liquid-universe-next-handoff-YYYY-MM-DD.tar.gz
```

このtarballには、次作で再利用しやすい実装ファイル、次作用AGENTS、concept brief、reuse mapを含める。`visual-references/`、`dist/`、`node_modules/`、`test-results/` は含めない。

## 7. 次作エージェントへの一文

このプロジェクトを「模倣未完の続き」として扱わないこと。ここから作るのは、Liquid Universeという独自作品であり、流用するのは構造、黒円、動きの思想、責務分離だけである。
