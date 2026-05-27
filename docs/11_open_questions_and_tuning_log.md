# 11. Open Questions / Tuning Log

この文書は、実装中に出た未決事項、観察、調整メモを残す場所です。

## 未決事項

- [ ] パネルの最終アスペクト比。
- [ ] Reference Modeの優先順位。
- [ ] 深青宇宙Modeの星量。
- [ ] 白地鉱物Modeの黒円リング強度。
- [ ] Original Modeの初期ラインナップ。
- [ ] `honke-original/videos/` 配下2本の出所確認。
- [ ] AutoのReference / Original出現比率。
- [ ] shaderVariant切替時の見せ方。
- [ ] LED撮影由来の黒い方眼を作品内表現として残すかどうか。
- [ ] Move intensityの初期段階名。
- [ ] Version 1由来MoveをどのOriginal Moveとして登録するか。
- [ ] Compositionを使うPatternと使わないPatternの切り分け。
- [ ] FireflySystemの密度・明るさ・またたきの初期値。

## 調整ログ

### 2026-05-27

対象:

- Phase 3 Vortex Debug

変更内容:

- デバッグ表示段階でも黒円の中心は完全な黒として扱う。

理由:

- 黒円は全Modeで一貫する作品の核なので、模様やレンズ実装前から黒い存在として見える方がビジュアル判断しやすい。

結果:

- デバッグ表示の中心core合成を完全黒に変更。

次に試すこと:

- Phase 4でEvent Horizon / Photon Ring / Gravity Lensを追加し、中心黒を維持したまま周辺だけを歪ませる。

### 2026-05-27

対象:

- Phase 4 BlackHoleField

変更内容:

- `blackHoleField.glsl` を追加し、Event Horizon / Photon Ring / Gravity Lensを共通shader chunkとして実装。
- 黒円の中心が大きすぎる印象を避けるため、Vortexの半径初期値をやや小さめに調整。
- 本家写真を確認し、黒い芯は短冊幅に対して控えめ、外側の渦リングは広めという方向に寄せた。

理由:

- 黒円は常に黒く見えることを優先しつつ、周辺リングと歪みでブラックホール感を出すため。

結果:

- スクリーンショットで、3つの黒円、明るいPhoton Ring、背景模様の歪みを確認。

次に試すこと:

- Phase 5でMode / Preset基盤を作り、今のデバッグ模様を実Modeへ置き換えられる状態にする。

### 2026-05-27

対象:

- Phase 5 Pattern Mode / Preset / Effect基盤

変更内容:

- `patterns/` にMode / Preset型、Reference / Original Mode、Preset定義、`PatternRegistry` を追加。
- `effects/` にEffect IDとEffect定義を追加。
- lil-guiでMode / Presetを選択できるようにし、Preset値をshader uniformへ反映。
- デバッグshaderの色、LED強度、domain、BlackHoleStyleをPresetから変えられるようにした。

理由:

- Reference / Originalを別エンジンにせず、同じMode / Preset構造に載せるため。

結果:

- `ref-deep-blue-universe` などのMode一覧がGUIに表示され、初期Preset値が画面に反映される。

次に試すこと:

- Phase 6でReference Modeの実shader variantを増やし、デバッグ模様から本家観察ベースの見た目へ寄せる。

### 2026-05-27

対象:

- Phase 6 Reference Mode実装

変更内容:

- `deepUniverse.frag.glsl` と `mineralFluid.frag.glsl` を追加し、最低2つのReference Modeを専用shader variantで描画。
- `shaderRegistry` でvariantごとに小さなshader chunkを組み替える方式にした。
- `ref-deep-blue-universe` は深青、暗い筋、星粒、LEDドットを優先。
- `ref-pale-mineral` は橙の楕円セル、生成りの地、淡いシアン輪郭を優先。
- 黒円は各Modeへ埋め込まず、共通 `BlackHoleField` を継続利用。

理由:

- Reference / Originalを別エンジンにせず、Mode metadataとshaderVariantで見た目を切り替える設計を保つため。
- Phase 6の完了条件である「最低2つのReference Modeが区別できる」を満たすため。

結果:

- `ref-deep-blue-universe` と `ref-pale-mineral` はGUIから切り替えられ、黒円の物理・リング・レンズは共通のまま表示できた。
- `npm run build` が通り、右ブラウザで表示とconsole errorなしを確認。

次に試すこと:

- Phase 7でOriginal Modeを最低1つ実装する。
- Phase 8でLED / fireflies / glowを共通Effect chunkへ整理し、Mode shader内の重複を減らす。

### 2026-05-27

対象:

- Phase 6 Reference Mode LED表現調整

変更内容:

- LEDドット表現の暗い格子状コントラストを弱め、規則的な黒い方眼が出ないようにした。
- 星粒や微細な発光感は残し、撮影由来に見える黒い網目は作品側の意図から外す方向に寄せた。

理由:

- 本家写真の黒い方眼は、実物の作品要素ではなくカメラ撮影時のモアレ・LED撮影アーティファクトの可能性が高いため。

結果:

- Modeの地色を暗い網目で割らず、模様の連続性を優先する方針に変更。

次に試すこと:

- Phase 6のReference候補を見ながら、完成扱いにできるModeを決める。

### 2026-05-27

対象:

- 動画出所未確定化 / 実験shaderへの再分類

変更内容:

- `honke-original/videos/` 配下の動画を本家資料として扱ったが、ユーザー指摘後にVersion 1由来の可能性もあるため、出所未確定として扱うことにした。
- `liquidCellular.frag.glsl` はReference Mode根拠から外し、出所未確定動画由来の実験shaderとして退避。
- `ref-magenta-green-cell` は完成候補から外し、いったんデバッグvariantへ戻した。

理由:

- 本家Reference Modeと自作V1/出所未確定の見た目を混ぜると、Mode分類と評価が崩れるため。

結果:

- Phase 6のReference候補は `ref-deep-blue-universe` と `ref-pale-mineral` の2種に戻した。
- `liquid-cellular` は出所未確定動画由来の実験として残すが、完成Mode扱いにはしない。

次に試すこと:

- 本家Referenceは本家写真、または出所が確認できた本家動画だけを根拠にする。
- `honke-original/videos/` の2本は本家/V1/不明のどれかを確認してから再分類する。

### 2026-05-27

対象:

- Phase 6.5 Visual System再設計

変更内容:

- `docs/12_phase6_5_visual_system_redesign.md` を追加し、Pattern / Color / Move / Composition / FireflySystem / Effect / Vortexへ再分解。
- 白い点々はEffectではなくFireflySystem、背景の動きはMove、黒円への巻き込みはVortexへ分類。
- Compositionは必要な場合だけ使う任意カテゴリとし、ワンポイントはseed付きRandomで扱う方針にした。
- Version 1で良かった振動はOriginal Moveとして採用可能な方針にした。

理由:

- Deep BlueのようなMode内に、青背景、白い点、薄い格子、flow、glowが混ざると、前回同様に調整不能になるため。

結果:

- 以後の実装はPhase 6.5を挟み、型とshader共通chunkを再整理してからMode品質改善へ戻る。

次に試すこと:

- `patternTypes.ts` とPreset型にColor / Move / Composition / Fireflyを追加し、Deep Blueを分解移行する。

### 2026-05-27

対象:

- Phase 6.5 Visual Systemコード実装

変更内容:

- Presetを `color` / `move` / `composition` / `fireflies` / `effects` に分離。
- Effectは `glow` / `specular` / `grain` / `scanline` に整理し、`fireflies` と `ledGrid` をEffectから外した。
- Color / Move / Composition / Fireflyごとのresolverを追加し、rendererへ渡すuniform payloadを分離。
- `move.glsl` / `composition.glsl` / `fireflies.glsl` を共通chunkとして追加し、variant shaderから呼ぶ形へ移行。

理由:

- Mode内に白い点、flow、配色、質感を抱え込ませず、Patternを模様生成へ戻すため。

結果:

- `npm run build` が通り、右ブラウザで全Mode切替時にshader errorが出ないことを確認。
- Deep Blueで共通FireflySystem、Move、BlackHoleFieldが同時に動くことを確認。

次に試すこと:

- GUIでMove intensity / Move program / Firefly密度を確認・調整できるようにする。
- 完成Mode扱いにする前に、Deep Blue / Pale Mineralの見た目を再チューニングする。

### 2026-05-27

対象:

- Phase 6.5 GUI調整項目

変更内容:

- lil-guiにMove intensity、Move program、FireflySystem density、Effect glowを追加。
- GUI値はPresetを直接変更せず、一時的なVisualTuningとしてPreset解決時に重ねる形にした。

理由:

- 良い状態を探す調整余地を残しつつ、Pattern / Move / FireflySystem / Effectの分離を崩さないため。

結果:

- `npm run build` が通り、`localhost:4173` でGUI操作後もshader errorが出ないことを確認。

次に試すこと:

- GUIで見つけた良いVisualTuningをPresetへ保存する手順を決める。
- Color mainColor / colorSchemeのGUI確認項目を追加するか判断する。

### 2026-05-27

対象:

- Phase 6.5 Color GUI / palette tuning

変更内容:

- VisualTuningに `mainColor` と `colorScheme` を追加。
- GUIにColorカテゴリを追加し、MainとSchemeを切り替えられるようにした。
- Presetと同じColor指定のときは既存paletteを維持し、GUIでColorを変えたときだけscheme由来paletteを生成するようにした。

理由:

- ColorをPatternから独立した調整対象として扱いつつ、既存Presetの見た目を不用意に崩さないため。

結果:

- `npm run build` が通り、`localhost:4173` でColor変更後もshader errorなしを確認。

次に試すこと:

- Color GUIで良い組み合わせを探し、Deep Blue / Pale Mineralの完成候補Presetへ反映するか判断する。
- Composition GUIを出すか、まず既存Referenceの見た目チューニングに進むか決める。

### 2026-05-27

対象:

- Phase 6.5 Composition GUI / random spot tuning

変更内容:

- VisualTuningに `compositionMode` と `compositionSeed` を追加。
- GUIにCompositionカテゴリを追加し、ModeとSeedを切り替えられるようにした。
- Composition値はPresetを直接変更せず、一時的なVisualTuningとしてPreset解決時に重ねる形にした。

理由:

- ワンポイント構図や周辺寄せなどをPatternから独立して試せるようにするため。
- Deep Blue / Pale Mineralを完成候補にする前に、Compositionの効き方をGUIで比較できる状態にするため。

結果:

- `npm run build` が通り、`localhost:4173` でCompositionをRandom Spotへ切り替えても現在ページのshader errorなしを確認。
- 黒円は引き続き共通BlackHoleFieldのまま、Compositionは背景Patternへのマスクとして作用する。

次に試すこと:

- Composition GUIでDeep Blue / Pale Mineralに合う初期値を探す。
- 良いVisualTuningをPresetへ保存する手順を決める。

### 2026-05-27

対象:

- Phase 6.5 Effect GUI / texture tuning

変更内容:

- VisualTuningに `specular` / `grain` / `scanline` を追加。
- GUIのEffectsカテゴリで `glow` / `specular` / `grain` / `scanline` を個別調整できるようにした。
- Effect値はColor / Move / Compositionと同じくPresetを直接変更せず、一時的なVisualTuningとして重ねる形にした。

理由:

- Effectを補助的な質感処理としてPatternから独立させたまま、濡れ感・粒状感・走査線感を比較できるようにするため。
- Deep Blue / Pale Mineralの完成候補調整前に、質感のON/OFFと強度をGUIから確認できる状態にするため。

結果:

- `npm run build` が通り、`localhost:4173` でEffectsの4項目表示と現在ページのshader errorなしを確認。

次に試すこと:

- Deep Blue / Pale MineralのColor / Move / Composition / FireflySystem / Effect値を見ながら初期Preset候補を決める。
- GUIで決めたVisualTuningをPresetへ反映する保存手順を作るか、まず手作業でPreset値へ反映するか判断する。

### 2026-05-27

対象:

- Phase 6.5 Deep Blue / Pale Mineral初期Preset候補チューニング

変更内容:

- Deep BlueはColorをblue + same-family-black方向へ寄せ、明るすぎる青と白点密度を抑えた。
- Deep BlueはMoveをcalm寄り、Effectを低scanline・低grainへ寄せ、黒円リングの発光も少し控えめにした。
- Pale Mineralは白点密度とglowを下げ、セル輪郭と淡い鉱物感が前に出るようにした。
- 2つのPresetへ明示的なComposition `full` を追加し、GUI表示とPreset値の対応を分かりやすくした。

理由:

- Phase6.5の分離後、Patternを増やす前にColor / Move / Composition / FireflySystem / Effectの初期値を実画面で扱える候補へ整えるため。
- Deep Blue / Pale Mineralはまだ完成Modeではなく、完成判定前の見た目候補として扱うため。

結果:

- `npm run build` が通り、`localhost:4173` でDeep Blue / Pale Mineral切替後も現在ページのshader errorなしを確認。
- Deep Blueは暗めの青宇宙寄り、Pale Mineralは白点が控えめな鉱物セル寄りになった。

次に試すこと:

- Deep Blueは星量と黒円リングの強度をもう一段確認する。
- Pale Mineralはセルの反復感をPattern shader側で弱めるか、Preset値だけで抑えるか判断する。

### 2026-05-27

対象:

- Phase 6.5 Effect shader共通chunk化 / 並列開発handoff

変更内容:

- `effects.glsl` を共通shader chunkとして追加し、`glow` / `specular` / `grain` / `scanline` の適用処理をvariant shaderから分離。
- `deepUniverse` / `mineralFluid` / `liquidCellular` / debug variantは、Pattern固有のspecular maskだけを持ち、Effect適用は共通chunkを呼ぶ形にした。
- `docs/13_parallel_development_handoff.md` を追加し、並列開発時の担当範囲と所有ファイルを明文化した。

理由:

- Pattern shader担当がMode追加や見た目調整を進めるとき、Effect処理のコピーや横断編集が発生しないようにするため。
- Phase6.5の責務分離が実装とdocsの両方で説明できる状態にして、並列開発へ移れる境界を作るため。

結果:

- `npm run build` が通り、`localhost:4173` で全Mode切替後も現在ページのshader errorなしを確認。
- 以後は `docs/13_parallel_development_handoff.md` の所有範囲を守る前提で並列開発に入れる。

次に試すこと:

- 並列開発では、まず担当範囲を宣言してからColor / Move / Composition / FireflySystem / Pattern Shaders / Integrationへ分かれる。
- AutoはIntegration担当の単独作業としてPhase 9で進める。

### 2026-05-27

対象:

- Phase 6.5 Spec Redesign docs-only boundary

変更内容:

- `Spec Redesign` を `docs/` 限定作業として明文化。
- Phase 6.5の作業順を、仕様整理、型/データ、Preset移行、shader分離、FireflySystem、GUI/Tuningへ分け直した。
- 並列開発handoffで、README更新は今回のSpec Redesign対象外とした。

理由:

- `Spec Redesign` 依頼時に、他スレッドのコード領域やREADMEへ踏み込まない境界を明確にするため。
- Phase 6.5の「仕様整理」と「コード実装」が混ざると、責務分離を守るための再設計自体が曖昧になるため。

結果:

- 今回のSpec Redesignはdocs内の仕様同期だけで完結する境界になった。
- Color / Move / Composition / FireflySystem / Effect / Pattern Shaders / Integrationは、各担当が別スレッドで宣言してから進める前提を維持した。

次に試すこと:

- 各担当は `docs/13_parallel_development_handoff.md` の所有範囲を宣言してから作業する。
- Integration担当はPhase 9までAuto実装に進まない。

### YYYY-MM-DD

対象:

変更内容:

理由:

結果:

次に試すこと:

## Visual Observation Notes

### 素材名 / ファイル名

観察:

- 黒円:
- リング:
- 模様:
- 色:
- LED感:
- 発光粒:
- 動きの推測:

実装に反映する候補:

- Mode:
- Preset:
- Effect:
- BlackHoleStyle:
