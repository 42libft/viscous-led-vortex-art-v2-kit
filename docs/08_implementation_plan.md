# 08. 実装手順

## 0. 全体方針

一気に完成を目指さない。Phaseごとに、動く小さな状態を積み上げる。

各Phaseの最後に必ず確認する。

- `npm run build` が通る。
- ブラウザで表示できる。
- `src/main.ts` が薄いまま。
- 責務が適切なフォルダーに分かれている。

## Phase 0: 資料配置と方針確認

目的:

- この資料集をプロジェクトに置く。
- エージェントが設計方針を理解する。
- visual referencesフォルダーに素材を入れられる状態にする。

作業:

- `AGENTS.md` を読む。
- `docs/00_final_design_decisions.md` を読む。
- `visual-references/README.md` を読む。
- 必要なら写真・動画を `visual-references/` に入れる。

完了条件:

- 実装エージェントがCを作らないことを理解している。
- Autoがランダムであることを理解している。
- 黒円がブラックホールであることを理解している。

## Phase 1: プロジェクト骨格

目的:

- Vite + TypeScript + WebGL2の最小構成を作る。
- `main.ts` を薄くする。

作業:

- `npm create vite` 相当の構成を用意する。
- `index.html` に `<canvas id="gl"></canvas>` を置く。
- `src/main.ts` から `createApp()` を呼ぶ。
- `app/`, `renderer/`, `styles/` を作る。
- fullscreen triangleで固定色を描く。

完了条件:

- 画面全体が描画される。
- shader compile errorが画面に出る。
- `main.ts` が10〜20行程度。

## Phase 2: 短冊パネル

目的:

- 中央の短冊型表示領域を作る。

作業:

- `display/panel.ts` または `shaders/common/panel.glsl` を作る。
- `panelUv` を実装する。
- パネル内外を色分けして確認する。
- パネル外は黒い展示空間にする。

完了条件:

- 中央に細長い矩形が見える。
- パネル内UVが安定している。
- resizeしても破綻しない。

## Phase 3: VortexSystem物理

目的:

- 3つの黒円の位置・速度・接近・swapをTypeScript側で作る。

作業:

- `simulation/VortexSystem.ts` を作る。
- 初期3点を作る。
- 壁反射を作る。
- 近接圧力を作る。
- swapを作る。
- uniform配列に詰める。

完了条件:

- 3つの円がパネル内を漂う。
- 近づくと押し合う。
- たまに高速swapする。
- まだ模様は単色でよい。

## Phase 4: BlackHoleField shader

目的:

- 黒円をブラックホールとして見せる。

作業:

- `shaders/common/blackHoleField.glsl` を作る。
- Event Horizonを描く。
- Photon Ringを描く。
- Gravity Lensで背景UVを歪める。
- debug viewを用意する。

完了条件:

- 黒円中心が完全に黒い。
- 外周にリングがある。
- 周辺の模様、またはテストグリッドが歪む。
- 淵で周回しているような動きが見える。

## Phase 5: Pattern Mode基盤

目的:

- Mode / Preset / Effectの型とRegistryを作る。

作業:

- `patterns/patternTypes.ts` を作る。
- `PatternRegistry.ts` を作る。
- `referenceModes.ts` を作る。
- `originalModes.ts` を作る。
- `referencePresets.ts` と `originalPresets.ts` を作る。
- GUIからMode / Presetを選べるようにする。

完了条件:

- Mode一覧がGUIに出る。
- Presetを切り替えられる。
- Presetの値がuniformに反映される。

## Phase 6: Reference Mode実装

目的:

- 本家観察に基づくReference Modeを実装する。

優先順:

1. `ref-deep-blue-universe`
2. `ref-pale-mineral`
3. `ref-magenta-green-cell`
4. `ref-blue-purple-vein`

作業:

- shader variantを増やす。
- palette / material / domain paramsを調整する。
- visual referencesを見ながら観察メモを残す。

完了条件:

- 最低2つのReference Modeが見た目として区別できる。
- 黒円は全Modeで共通して動く。
- LED / firefly / glowが乗る。

## Phase 6.5: Visual System再設計

目的:

- Mode肥大化を止め、Pattern / Color / Move / Composition / FireflySystem / Effectを分ける。

作業:

- `docs/12_phase6_5_visual_system_redesign.md` を基準仕様にする。
- `patternTypes.ts` に `ColorParams`, `MoveParams`, `CompositionParams`, `FireflyParams` を追加する。
- Deep Blue内に混ざっている青背景、白い点、flow、薄い格子風処理を分類し直す。
- FireflySystemをEffectから分離する。
- `ledGrid` は撮影由来の黒い方眼と混ざるため、MVP優先から外す。
- Move intensityとMove programをPreset / Random対象にする。

並列作業で `Spec Redesign` として依頼された場合の範囲:

- 対象は `docs/` 内の仕様整理だけにする。
- `src/`, `README.md`, `visual-references/`, `package*.json` は触らない。
- 型追加、Preset移行、shader共通化、GUI追加は別担当またはIntegration作業に分ける。
- 仕様変更の理由、未決事項、次に渡す作業を `docs/11_open_questions_and_tuning_log.md` に残す。

完了条件:

- `Spec Redesign` のみの場合、`docs/` 内で新分類、責務境界、未決事項が同期されている。
- PresetがPattern / Color / Move / Fireflyを別々の値として持つ。
- 白い点々がMode固有shaderから共通FireflySystemへ移る。
- Moveが `calm / normal / active / violent` の共通段階を持つ。
- Compositionが任意カテゴリとして扱われる。
- `npm run build` が通る。

## Phase 7: Original Mode実装

目的:

- 自分たちの蒼氓蟲譜としてのModeを作る。

優先候補:

1. `orig-black-oil-cell`
2. `orig-aurora-membrane`
3. `orig-insect-specimen`

完了条件:

- 最低1つのOriginal Modeが動く。
- Referenceの単なる色替えではなく、素材や密度が違う。

## Phase 8: Effect System

目的:

- Modeをまたいで補助Effectを使えるようにする。

作業:

- `effects/effectTypes.ts` を作る。
- scanline / glow / specularを整理する。
- ModeごとのallowedEffectsを反映する。

完了条件:

- EffectをGUIで調整できる。
- Mode追加時にEffectコードをコピーしなくてよい。
- FireflySystemやBlackHoleStyleとEffectが混ざっていない。

## Phase 9: RandomAutoDirector

目的:

- 固定順序ではないランダムAutoを実装する。

作業:

- `settings/RandomAutoDirector.ts` を作る。
- `autoWeight` を使って候補選択する。
- 履歴で同一連続を避ける。
- hold / transitionを実装する。
- 補間可能な値を補間する。

完了条件:

- Autoがランダムに次Presetを選ぶ。
- 同じPresetが連続しない。
- 動きが急すぎない。
- Autoを切って手動選択できる。

## Phase 10: UI / 没入モード / README

目的:

- 使用体験を整える。

作業:

- lil-guiを整理する。
- 右下UIを作る。
- Settings表示切替を作る。
- Immersive / Fullscreenを作る。
- READMEを書く。
- GitHub Pages設定を確認する。

完了条件:

- 通常鑑賞できる。
- 設定UIを隠せる。
- buildとpreviewが通る。
- READMEだけで起動できる。

## Phase 11: 調整と合格判定

目的:

- MVP完成判定。

作業:

- `docs/09_acceptance_checklist.md` を埋める。
- visual referencesと比較する。
- 高負荷ならrenderScaleやshaderを調整する。
- 破綻しやすいPresetをAuto候補から外す。

完了条件:

- MVP要件を満たす。
- もう一度ゼロから作り直す必要がない構造になっている。
