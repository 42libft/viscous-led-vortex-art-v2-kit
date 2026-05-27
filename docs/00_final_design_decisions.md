# 00. 最終設計決定

この文書は、二号機の上位方針をまとめたものです。実装中に迷った場合は、この文書を優先します。

## 1. 二号機の立ち位置

二号機は、現行一号機を継ぎ足して延命するものではありません。ゼロから整理して作る、短冊型LED作品レンダラです。

ただし、制作ツール化はしません。録画、投稿、タイムライン編集、外部入力、展示運用、複数作品管理などはMVP対象外です。

## 2. 作品の最小分解

作品はシンプルに次の要素で構成されます。

```text
作品 = 短冊型ディスプレイ
     + 3つのブラックホール的黒円
     + Pattern
     + Color
     + Move
     + 必要な場合だけComposition
     + FireflySystem
     + 必要な場合だけEffect
     + ランダムAuto遷移
```

この分解を実装構造にも反映します。

## 3. AでもBでもなく、A群とB群を同じ構造で扱う

A: 本家の特定の模様を再現するReference Mode群。  
B: 自分たちで考えたOriginal Mode群。

二号機では、AとBを対立させません。どちらも同じ `PatternMode`、`PatternPreset`、`Effect` の仕組みに乗せます。

ReferenceかOriginalかは、エンジンの違いではなく、メタデータの違いです。

```ts
type PatternOrigin = 'reference' | 'original';
```

## 4. 黒円はModeの中に入れない

黒円は模様Modeの一部ではありません。全Modeに共通する一級モジュールです。

黒円の視覚モデルは、単なる黒い渦ではなくブラックホールです。

```text
BlackHole
├── Event Horizon       完全に黒い中心
├── Photon Ring         ぎりぎり外周で模様が高速周回して見える帯
└── Gravity Field       背景模様を屈折・圧縮・引き伸ばす重力レンズ領域
```

黒円の「動き」は `simulation`、黒円の「重力場」は `shader/common`、黒円の「見た目」は `VortexStyle` または `BlackHoleStyle` として分離します。

## 5. Pattern / Color / Move / Preset / Effectを分ける

- Pattern: 模様の生成アルゴリズム。
- Color: メイン色と配色ルール。
- Move: 背景模様の流れ、波、脈動、振動、遷移演出。
- Composition: 模様を全面、ワンポイント、下部、奥/手前レイヤーなどに配置する任意カテゴリ。
- FireflySystem: ほぼ常在する白い発光点。
- Effect: glow、specular、grain、scanlineなどの補助質感。
- Preset: これらの具体的な値セット。

見た目を増やしたいときに、すぐPatternやshaderVariantを増やさないこと。まずColor、Move、Composition、Presetで表現できるか確認します。

## 6. Autoは固定順序ではない

Autoは、規則的な順番再生ではありません。

Autoの良さは、次の遷移先がランダムで、ライブ感があることです。二号機では、このランダム性を作品の呼吸として扱います。

```text
RandomAutoDirector:
現在状態から次のPreset / Palette / EffectParamsを重み付きランダムで選び、
破綻しない範囲でゆっくり補間する。
```

ただし、完全な無秩序にはしません。同じPresetの連続、極端に似た状態の連続、視覚破綻する組み合わせは避けます。

## 7. shaderはchunk + variant方式にする

現行一号機の問題は、巨大な1ファイルにshader、物理、GUI、Autoが混ざることです。二号機では、少なくとも次の分割を守ります。

```text
shaders/
├── common/
│   ├── math.glsl
│   ├── noise.glsl
│   ├── panel.glsl
│   ├── blackHoleField.glsl
│   ├── ledPost.glsl
│   └── lighting.glsl
└── variants/
    ├── mineralFluid.frag.glsl
    ├── deepUniverse.frag.glsl
    ├── liquidCellular.frag.glsl
    ├── veinBotanical.frag.glsl
    └── oilMembrane.frag.glsl
```

## 8. 最初に作るReference Mode

添付写真から、まず以下のReference Mode / Presetを目標にします。

1. `ref-pale-mineral`: 白地、鉱物、水彩、標本膜。
2. `ref-deep-blue-universe`: 深青、宇宙、星、ブラックホール感。
3. `ref-magenta-green-cell`: マゼンタ、グリーン、細胞膜、油膜。
4. `ref-blue-purple-vein`: 青紫、ピンク、葉脈、血管、枝。

## 9. 最初に作るOriginal Mode

Reference Modeが安定してから、以下をOriginalとして追加します。

1. `orig-black-oil-cell`: 黒油膜、細胞、濁った膜。
2. `orig-aurora-membrane`: オーロラ、膜、宇宙と細胞の中間。
3. `orig-insect-specimen`: 昆虫標本、翅脈、鉱物、発光粒。

## 10. 実装の合格条件

MVPの合格条件は次です。

- 中央に短冊パネルが出る。
- パネル外は黒い展示空間として残る。
- 3つの黒円が常に存在する。
- 黒円はEvent Horizon、Photon Ring、Gravity Lensを持つ。
- 模様ModeをReference / Originalに分類できる。
- EffectをModeから独立してON/OFFまたは強度調整できる。
- Autoが重み付きランダムで次状態を選ぶ。
- `main.ts` が薄い入口のまま保たれる。
