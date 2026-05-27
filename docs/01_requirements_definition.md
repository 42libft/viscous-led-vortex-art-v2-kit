# 01. 要件定義

## 1. 一文ゴール

暗闇に浮かぶ短冊型LEDディスプレイの中で、3つのブラックホール的黒円が漂い、液体、細胞膜、宇宙、鉱物、葉脈、油膜のような模様が黒円に歪められながら、ランダムに別の生態系へ遷移していくリアルタイム生成作品を作る。

## 2. スコープ

MVPで作るもの:

- Vite + TypeScript + WebGL2 のブラウザ作品。
- 短冊型パネル表示。
- 3つの黒円 / ブラックホール。
- 黒円周辺の重力レンズ、Photon Ring、Event Horizon。
- Reference Mode群。
- Original Mode群。
- Pattern / Color / Move / Compositionによる生成表現。
- ほぼ常在するFireflySystem。
- scanline、glow、specular、grainなどの補助Effect。
- lil-guiによる調整UI。
- 右下のUI表示切替と没入モード。
- 重み付きランダムAuto遷移。
- GitHub Pagesに載せられる構成。

MVPで作らないもの:

- 動画録画機能。
- スクリーンショット管理機能。
- 投稿・共有機能。
- タイムライン編集。
- 外部入力、音声反応、センサー反応。
- 参照写真を実行時テクスチャとして読み込む機能。
- 作品制作ツールとしてのUI。
- React / Vue / Three.jsによる大規模UI化。

## 3. 機能要件

### FR-001 短冊パネル

画面全体は黒背景とし、中央に縦長の短冊パネルを表示する。

要件:

- パネルは画面中央に配置する。
- パネル内UVは `panelUv` として 0.0 - 1.0 に正規化する。
- パネル外は単なる透明ではなく、展示空間として黒く残す。
- パネルのアスペクト比は調整可能にするが、初期値は一号機相当の細長い比率にする。

### FR-002 ブラックホール3点

3つの黒円を常時表示する。

要件:

- 3点は固定数でよい。
- それぞれ位置、速度、半径、spin、styleを持つ。
- パネル内をゆっくり漂う。
- 壁に当たると反射または押し戻される。
- 近接時に押し合い、圧力が溜まったらswapする。
- shader上ではEvent Horizon、Photon Ring、Gravity Lensを持つ。

### FR-003 Pattern

模様生成アルゴリズムをPatternとして管理する。

要件:

- Patternは `reference` または `original` のoriginを持つMode / Presetから参照される。
- Patternはfamily、shaderVariant、defaultPresetIdを持つ。
- Patternは黒円物理を持たない。
- Patternは模様生成に集中し、白い点、全体色、動き、配置制御を抱え込まない。

### FR-004 Pattern Preset

具体的な見た目の状態はPresetとして管理する。

要件:

- PresetはModeに紐づく。
- Presetはpattern、color、move、composition、firefly、effects、blackHoleStyle、seedを持つ。
- Reference PresetとOriginal Presetを同じ型で扱う。
- 良い状態が出たらPresetとして保存しやすくする。

### FR-005 Color System

色はPatternから独立させる。

要件:

- メイン色を `blue / red / yellow / green / white / purple / pink` から選べる。
- 配色ルールを `sameFamily / sameFamilyBlack / accentColor / contrast` として扱う。
- 同じPatternに異なるColorを適用できる。
- ColorはPreset固定にもRandom選択にも対応する。

### FR-006 Move System

背景模様の動きをMoveとして管理する。

要件:

- 共通の激しさ `calm / normal / active / violent` を持つ。
- Move programとして `stillBreath / directionalFlow / counterFlowLayers / cellularPulse / oilTremor / transitionShake` などを扱う。
- Pattern固有の特殊Moveと、Preset切替時のTransition Moveを区別する。
- 黒円への巻き込みはMoveではなくBlackHoleFieldが担当する。

### FR-007 Composition System

Compositionは必要なModeだけが使う任意カテゴリとする。

要件:

- `none / full / randomSpot / bottomBloom / edgeOverflow / depthLayers` を扱える。
- ワンポイント表現はseed付きRandomで位置や大きさを決める。
- 奥と手前の2層が逆方向に動く表現を将来扱える。
- Compositionを使わないPatternは全面描画のまま成立する。

### FR-008 FireflySystem

白い点々はEffectではなく、作品共通のFireflySystemとして扱う。

要件:

- ほぼ全Modeに存在する。
- 白〜淡色の小さな発光点を生成する。
- 密度、明るさ、またたき速度をPresetまたはRandomで調整できる。
- Event Horizon内では消える。

### FR-009 Effect System

EffectはModeから独立させる。

対象Effect:

- scanline。
- glow。
- specular。
- grain / pixel texture。

要件:

- EffectはON/OFFまたは強度を持つ。
- ModeごとにallowedEffectsを設定できる。
- Effect追加時にPattern Modeのコードを大きく変えない。
- `ledGrid` は撮影由来の黒い方眼と混ざりやすいため、MVPでは優先しない。
- `fireflies` はEffectではなくFireflySystemへ移す。
- `vortexRing` はEffectではなくBlackHoleStyleへ寄せる。

### FR-010 Random Auto

Autoは固定順序ではなくランダムに次状態を選ぶ。

要件:

- 次のPresetまたは状態を重み付きランダムで選ぶ。
- Preset固定状態と、Pattern / Color / Move / CompositionをRandomに選ぶ一期一会状態を扱う。
- 同じPresetの連続を避ける。
- 似すぎた状態の連続を避ける。
- 破綻する組み合わせを避ける。
- 補間できる値はゆっくり補間する。
- shaderVariantが変わる場合は、無理な連続補間をしない。

### FR-011 GUI

lil-guiで主要値を調整できる。

調整対象:

- renderScale。
- speed。
- selected mode。
- selected preset。
- Auto on/off。
- mainColor。
- colorScheme。
- Move intensity。
- Move program。
- Firefly密度。
- glow強度。
- blackHoleStrength。
- photonRingStrength。
- gravityLensStrength。
- palette系の主要値。

### FR-012 ビジュアル参照

本家や自作一号機の写真・動画を置くためのフォルダーを用意する。

要件:

- `visual-references/honke-original/` に本家参考素材を置ける。
- `visual-references/self-v1/` に一号機や自作途中素材を置ける。
- 写真、動画、抽出フレーム、観察メモを分ける。
- 参照素材はMVPの実行時アセットにしない。

## 4. 非機能要件

### NFR-001 保守性

- `src/main.ts` は起動のみ。
- 1ファイルの肥大化を避ける。
- TypeScriptの型でPattern / Color / Move / Composition / Preset / Effectを安全に扱う。
- 魔法の数値はPresetやParamsに寄せる。

### NFR-002 性能

- WebGL2でリアルタイム描画する。
- DPRは上限を設ける。
- renderScaleで負荷調整できる。
- MVPでは原則単一pass。ただし将来FBOを追加できる構造にする。

### NFR-003 互換性

- WebGL2対応ブラウザで動く。
- GitHub Pagesで配信できる。
- Fullscreen API非対応でも描画本体は動く。

### NFR-004 参照素材の扱い

- `visual-references/` は資料置き場。
- public配信対象に入れる場合は明示的に判断する。
- 参照素材をshader textureとして使わない。

## 5. 完成条件

MVP完成とみなす条件:

- `npm run build` が通る。
- ブラウザで中央短冊パネルが表示される。
- 3つの黒円が漂い、周囲の模様を歪ませる。
- Reference Modeが最低2つ動く。
- Original Modeが最低1つ動く。
- Color / Move / FireflySystemがPatternから分離されている。
- Random Autoが固定順序ではなく次状態を選ぶ。
- GUIで主要値を変更できる。
- `docs/09_acceptance_checklist.md` のMVP項目を満たす。
