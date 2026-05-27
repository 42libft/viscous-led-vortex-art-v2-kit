# 13. Parallel Development Handoff

2026-05-27時点で、Phase 6.5の責務分離は並列開発に入れる最低条件を満たした。

## 1. 到達状態

- Presetは `Pattern / Color / Move / Composition / FireflySystem / Effect / BlackHoleStyle` を別値として持つ。
- Moveは背景模様の動き、Vortex / BlackHoleFieldは黒円への巻き込みとして分離済み。
- 白い点々はEffectではなく `FireflySystem` の共通shader chunkで扱う。
- Effectは `glow / specular / grain / scanline` の補助質感に整理済み。
- `move.glsl` / `composition.glsl` / `fireflies.glsl` / `effects.glsl` は共通chunk化済み。
- Reference / Originalは同じMode / Preset / shaderVariant基盤に載っている。
- `main.ts` は入口のまま維持する。

## 2. 並列開発OKの条件

以下を守る場合、ここから並列開発してよい。

- 同じ作業ブランチや同じスレッドで、別担当の所有ファイルを同時に編集しない。
- Pattern shader担当は共通chunkを必要以上に編集しない。
- 共通chunk担当はvariant固有の見た目調整を同時に行わない。
- Integration担当だけが `presetResolver` / `WebGLRenderer` / GUI / Autoを横断的に触る。
- 変更ごとに `npm run build` とブラウザ表示確認を行う。

## 3. 推奨分担

### Spec Redesign

所有:

- `docs/`

担当内容:

- Phase状態、チューニングログ、未決論点の整理。
- Phase 6.5の責務境界と並列分担の同期。
- `liquidCellular` や出所未確定素材の分類メモ管理。

対象外:

- `src/` 以下のコード変更。
- `README.md` 更新。READMEはPhase 10、または明示依頼時に扱う。
- `visual-references/` の素材移動や配信対象化。

### Color System

所有:

- `src/colors/`

担当内容:

- `MainColor` / `ColorScheme` / palette生成。
- Preset値は触らず、候補値はdocsへ記録してからIntegration担当へ渡す。

### Move System

所有:

- `src/motion/`
- `src/shaders/common/move.glsl`

担当内容:

- `calm / normal / active / violent` の倍率調整。
- Move Programの追加や既存Programの改善。
- Vortex / BlackHoleFieldの巻き込みは担当外。

### Composition

所有:

- `src/composition/`
- `src/shaders/common/composition.glsl`

担当内容:

- `randomSpot` / `bottomBloom` / `edgeOverflow` / `depthLayers` の見え方調整。
- Pattern shaderへComposition固有ロジックを戻さない。

### FireflySystem

所有:

- `src/fireflies/`
- `src/shaders/common/fireflies.glsl`

担当内容:

- 白い点々の密度、明るさ、またたき、黒円周辺での消え方。
- FireflyをEffectへ戻さない。

### Effect System

所有:

- `src/effects/`
- `src/shaders/common/effects.glsl`

担当内容:

- `glow / specular / grain / scanline` の補助質感。
- FireflySystem、BlackHoleStyle、Pattern本体をEffectへ混ぜない。

### Pattern Shaders

所有:

- `src/shaders/variants/`

担当内容:

- `deepUniverse` / `mineralFluid` / `liquidCellular` などの模様生成。
- 共通のMove / Composition / Firefly / Effect chunkを呼ぶだけに留める。
- `liquidCellular` はReferenceではなくsource-uncertain / Original WIP扱いを維持する。

### Preset / Integration / Auto

所有:

- `src/patterns/`
- `src/settings/`
- `src/renderer/`
- `src/ui/`
- `src/app/`

担当内容:

- Preset値の採用、resolver、uniform、GUI、RandomAutoDirector。
- 横断変更が必要なため、他担当と同時編集しない。

## 4. 現時点の未決論点

- Deep Blue / Pale Mineralはまだ完成Modeではなく、初期Preset候補。
- Deep Blueは星量と黒円リング強度の追加確認が必要。
- Pale Mineralはセル反復感をPresetだけで抑えるか、Pattern shader側で弱めるか未決。
- `ref-magenta-green-cell` は完成候補ではなく、出所未確定系の扱いを再確認する。
- Autoは未実装。Phase 9でIntegration担当が単独で進める。

## 5. 並列開始時の合図

次の作業からは、担当範囲を宣言してから着手する。

例:

- `Color Systemだけ触ります。src/colors/ とdocsのメモだけ変更します。`
- `Pattern Shadersだけ触ります。src/shaders/variants/deepUniverse.frag.glsl だけ変更します。`
- `Integration担当としてRandomAutoDirectorを触ります。他スレッドは src/settings/ と src/ui/ を触らないでください。`
