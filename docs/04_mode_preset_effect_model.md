# 04. Pattern / Color / Move / Composition / Preset モデル

## 0. Phase 6.5更新

旧 `Mode / Preset / Effect` だけでは、Deep Blueの中に「青背景」「白い点」「薄い格子」「flow」「glow」が混ざり、前回のように何をどう調整しているか分からなくなる。

今後は次の分解を基準にする。

```text
Pattern + Color + Move + Composition? + FireflySystem + Effect? + Vortex
```

Effectは補助質感だけを扱う。白い点々はFireflySystem、背景の流れはMove、黒円リングはBlackHoleStyle、黒円への巻き込みはVortexへ移す。

## 1. 用語

### Pattern

模様の生成アルゴリズムです。

例:

- `mineral-fluid`
- `deep-universe`
- `liquid-cellular`
- `vein-botanical`
- `oil-membrane`

PatternはshaderVariantと結びつきます。

### Color

メイン色と配色ルールです。

例:

- `mainColor: blue`
- `colorScheme: sameFamily`
- `colorScheme: sameFamilyBlack`
- `colorScheme: accentColor`
- `colorScheme: contrast`

### Move

背景模様の動きです。

例:

- `calm + stillBreath`
- `normal + directionalFlow`
- `active + counterFlowLayers`
- `violent + transitionShake`

黒円への巻き込みはMoveではなくVortex / BlackHoleFieldです。

### Composition

Patternの出現範囲です。必要な場合だけ使います。

例:

- `none`
- `full`
- `randomSpot`
- `bottomBloom`
- `edgeOverflow`
- `depthLayers`

### Preset

Modeに渡す具体的な値のセットです。

例:

- `ref-pale-mineral-01`
- `ref-deep-blue-universe-01`
- `orig-black-oil-cell-01`

Presetは、Pattern、Color、Move、Composition、FireflySystem、補助Effect、seed、黒円の見え方を持ちます。

### Effect

どのModeにも重ねられる補助質感です。

例:

- `softGlow`
- `scanline`
- `specular`
- `grain`

## 2. 型定義案

```ts
export type PatternOrigin = 'reference' | 'original';

export type PatternFamily =
  | 'mineral'
  | 'universe'
  | 'cellular'
  | 'vein'
  | 'botanical'
  | 'oil'
  | 'cloud'
  | 'hybrid';

export type ShaderVariant =
  | 'mineral-fluid'
  | 'deep-universe'
  | 'liquid-cellular'
  | 'vein-botanical'
  | 'oil-membrane';

export type PatternMode = {
  id: string;
  label: string;
  origin: PatternOrigin;
  family: PatternFamily;
  shaderVariant: ShaderVariant;
  defaultPresetId: string;
  allowedEffects: EffectId[];
};

export type MainColor = 'blue' | 'red' | 'yellow' | 'green' | 'white' | 'purple' | 'pink';

export type ColorScheme = 'sameFamily' | 'sameFamilyBlack' | 'accentColor' | 'contrast';

export type MoveIntensity = 'calm' | 'normal' | 'active' | 'violent';

export type MoveProgram =
  | 'stillBreath'
  | 'directionalFlow'
  | 'counterFlowLayers'
  | 'cellularPulse'
  | 'oilTremor'
  | 'transitionShake';

export type CompositionMode =
  | 'none'
  | 'full'
  | 'randomSpot'
  | 'bottomBloom'
  | 'edgeOverflow'
  | 'depthLayers';

export type PatternPreset = {
  id: string;
  modeId: string;
  label: string;
  origin: PatternOrigin;
  seed: number;
  color: ColorParams;
  move: MoveParams;
  composition?: CompositionParams;
  fireflies: FireflyParams;
  material: MaterialParams;
  domain: DomainParams;
  effects: EffectParams;
  blackHoleStyle: BlackHoleStyleParams;
  autoWeight?: number;
  tags?: string[];
};
```

## 3. Mode定義例

```ts
export const referenceModes: PatternMode[] = [
  {
    id: 'ref-pale-mineral',
    label: 'Reference / Pale Mineral',
    origin: 'reference',
    family: 'mineral',
    shaderVariant: 'mineral-fluid',
    defaultPresetId: 'ref-pale-mineral-01',
    allowedEffects: ['softGlow', 'specular', 'grain'],
  },
  {
    id: 'ref-deep-blue-universe',
    label: 'Reference / Deep Blue Universe',
    origin: 'reference',
    family: 'universe',
    shaderVariant: 'deep-universe',
    defaultPresetId: 'ref-deep-blue-universe-01',
    allowedEffects: ['softGlow', 'grain'],
  },
];

export const originalModes: PatternMode[] = [
  {
    id: 'orig-black-oil-cell',
    label: 'Original / Black Oil Cell',
    origin: 'original',
    family: 'oil',
    shaderVariant: 'oil-membrane',
    defaultPresetId: 'orig-black-oil-cell-01',
    allowedEffects: ['scanline', 'specular', 'grain'],
  },
];
```

## 4. Preset設計のルール

Presetは「偶然いい見た目」を保存する場所です。

守ること:

- IDは人間が読める名前にする。
- Referenceは `ref-`、Originalは `orig-` で始める。
- modeIdとoriginを一致させる。
- seedを必ず持たせる。
- Autoに出したくないPresetは `autoWeight: 0` にする。

ID例:

```text
ref-pale-mineral-01
ref-pale-mineral-02-soft-white
ref-deep-blue-universe-01
ref-magenta-green-cell-01
ref-blue-purple-vein-01
orig-black-oil-cell-01
orig-aurora-membrane-01
```

## 5. Effect設計のルール

EffectはModeの内部ロジックに依存しすぎない。

良いEffect:

- glow。
- scanline。
- specular。
- grain。
- vignette。

Modeに入れるべきもの:

- 細胞膜の生成。
- 宇宙ノイズ。
- 葉脈分岐。
- 鉱物質なドメイン。

Effectに入れるべきもの:

- 光沢。
- 微細な粒状感。
- 必要な場合だけのscanline。

Effectに入れないもの:

- 白い発光点: FireflySystem。
- 背景の流れや脈動: Move。
- 黒円リング: BlackHoleStyle。
- 撮影由来の黒い方眼: 原則採用しない。

## 6. Registry

`PatternRegistry` は、ModeとPresetを一元管理します。

機能:

- 全Modeを返す。
- origin別にModeを返す。
- modeIdからModeを返す。
- presetIdからPresetを返す。
- modeIdに対応するPreset一覧を返す。
- defaultPresetを返す。
- 起動時に整合性チェックする。

```ts
export class PatternRegistry {
  constructor(modes: PatternMode[], presets: PatternPreset[]) {}

  getMode(id: string): PatternMode;
  getPreset(id: string): PatternPreset;
  getPresetsForMode(modeId: string): PatternPreset[];
  getAutoCandidates(filter?: AutoCandidateFilter): PatternPreset[];
  validate(): void;
}
```

## 7. ReferenceとOriginalの扱い

ReferenceとOriginalを別々の実装にしない。

良い設計:

```text
PatternMode.origin = 'reference' | 'original'
PatternPreset.origin = 'reference' | 'original'
```

悪い設計:

```text
ReferenceEngine
OriginalEngine
```

理由:

- 本家寄せで作ったPresetがOriginalに発展することがある。
- Original ModeにもReference由来のEffectが使える。
- 構造を分けるほど保守が難しくなる。

## 8. Mode追加手順

1. `patternTypes.ts` に必要なfamily / shaderVariantを追加する。
2. `referenceModes.ts` または `originalModes.ts` にModeを追加する。
3. `referencePresets.ts` または `originalPresets.ts` にPresetを追加する。
4. shader variantが必要なら `shaders/variants/` に追加する。
5. `shaderRegistry.ts` にvariantを登録する。
6. GUIのMode選択に表示されることを確認する。
7. Auto候補として適切なweightを設定する。
8. `docs/11_open_questions_and_tuning_log.md` に調整メモを残す。
