# 10. エージェント運用とプロンプト

## 1. 基本運用

実装エージェントには、Phase単位で依頼する。複数Phaseをまとめてやらせない。

良い依頼:

```text
Phase 1だけ実装してください。短冊パネルや黒円はまだ作らず、
Vite + TypeScript + WebGL2の骨格、薄いmain.ts、renderer分離、固定色描画まで。
```

悪い依頼:

```text
全部いい感じに作って。
```

## 2. 最初に渡すプロンプト

```text
このプロジェクトは viscous-led-vortex-art の二号機です。
まず AGENTS.md、docs/00_final_design_decisions.md、docs/01_requirements_definition.md、docs/03_architecture.md、docs/08_implementation_plan.md を読んでください。

重要方針:
- main.tsを巨大化させない
- 黒円は全Mode共通のBlackHole/VortexSystemとして扱う
- Pattern、Color、Move、Composition、FireflySystem、Preset、Effectを分ける
- Autoは固定順序ではなく重み付きランダム遷移
- C、つまり制作ツール化はMVP対象外

今回はPhase 1だけ実装してください。
完了後、変更したファイル、設計理由、次Phaseへの注意点を報告してください。
```

## 3. Phase別依頼テンプレート

### Phase 1

```text
Phase 1を実装してください。
目的は、Vite + TypeScript + WebGL2の骨格、薄いmain.ts、renderer分離、fullscreen triangleによる固定色描画です。
短冊パネル、黒円、Mode、Autoはまだ作らないでください。
```

### Phase 2

```text
Phase 2を実装してください。
目的は、中央の短冊パネルとpanelUvの実装です。
パネル内外が分かるdebug表示を作ってください。
黒円物理やModeはまだ作らないでください。
```

### Phase 3

```text
Phase 3を実装してください。
目的は、simulation/VortexSystem.tsで3つの黒円物理を作ることです。
位置、速度、壁反射、接近圧力、swapを実装してください。
shader上のブラックホール表現は次Phaseなので、今回は黒円表示だけで構いません。
```

### Phase 4

```text
Phase 4を実装してください。
目的は、BlackHoleField shaderの実装です。
Event Horizon、Photon Ring、Gravity Lensを作り、背景またはテストグリッドが歪むようにしてください。
黒円の淵では模様が高速周回しているように見えるorbitWarpを入れてください。
```

### Phase 5

```text
Phase 5を実装してください。
目的は、PatternMode / PatternPreset / Effectの型とRegistryを作ることです。
ReferenceとOriginalは別エンジンにせず、origin metadataで分類してください。
```

### Spec Redesign

```text
「Spec Redesign」のみ実装してください。
対象はdocs/の仕様整理だけです。
src/、README.md、visual-references/、package*.jsonには触らないでください。
docs/12_phase6_5_visual_system_redesign.mdを基準に、Phase 6.5の責務境界、並列分担、未決事項、次作業をdocs内で同期してください。
完了後、変更ファイル・実装内容・未決事項・次に必要な作業を報告してください。
```

### Phase 6.5

```text
Phase 6.5を実装してください。
目的は、Pattern / Color / Move / Composition / FireflySystem / Effectの再設計です。
まずdocs/12_phase6_5_visual_system_redesign.mdを読んでください。
今回は型と責務分離だけを進め、見た目の新Mode追加はしないでください。
白い点々はFireflySystem、背景の流れはMove、黒円リングはBlackHoleStyleへ分けてください。
```

### Phase 9

```text
Phase 9を実装してください。
目的は、RandomAutoDirectorです。
Autoは固定順序ではなく、重み付きランダムで次Presetを選んでください。
同じPresetの連続を避け、hold / transitionを実装してください。
```

## 4. レビュー用プロンプト

```text
今回の変更をレビューしてください。
以下を重点的に確認してください。

- main.tsが巨大化していないか
- renderer / simulation / patterns / effects / settings / ui の責務が混ざっていないか
- 黒円がMode内に埋め込まれていないか
- Autoが固定順序になっていないか
- Pattern / Color / Move / Composition / Preset / Effectが分離されているか
- Pattern / Color / Move / Composition / FireflySystem / Effectが混ざっていないか
- docs/08_implementation_plan.md の対象Phaseを超えた実装をしていないか
- npm run buildが通るか
```

## 5. 見た目調整プロンプト

```text
visual-references/honke-original/ に置いた資料を見て、現在の出力との差分を観察してください。
コードを変更する前に、以下を箇条書きで整理してください。

- 黒円の大きさ、位置、リングの違い
- 模様の密度の違い
- 色の主従の違い
- LED粒状感の違い
- 発光粒の量の違い
- Moveの方向、激しさ、特殊条件の違い
- Patternが全面か、部分的か、奥/手前レイヤーか
- 重力レンズ感の違い

その後、Pattern / Color / Move / Composition / FireflySystem / Effect / BlackHoleStyleのどこを変更すべきか提案してください。
```

## 6. エージェントに任せない方がいい判断

次の判断はユーザー確認が望ましい。

- C的な新機能を足すか。
- 参照写真をpublic配信対象にするか。
- 実行時に画像テクスチャを使うか。
- Three.jsやReactを導入するか。
- Autoを固定順序にするか。
- 黒円数を3以外にするか。
