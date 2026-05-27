# アーキテクチャへの含意

## このnotes群が実装に要求すること

蒼氓蟲譜の文脈を反映するには、単にshader内に機能を足すのではなく、責務分離を守る必要がある。

## 必須モジュール

```text
src/
├── display/
│   └── panel / viewport / outerDarkness
├── simulation/
│   └── VortexSystem
├── blackhole/
│   └── BlackHoleField / GravityLens / PhotonRing
├── patterns/
│   └── PatternMode / Preset / Registry
├── effects/
│   └── LuminousSwarm / LedGrid / Glow / Scanline
├── settings/
│   └── RandomAutoDirector / Params
└── shaders/
    ├── common/
    └── variants/
```

## 黒円は独立モジュールにする

黒円は全Mode共通の作品構成要素であり、Mode内に書かない。

Modeごとに変えてよいのは `VortexStyleParams` だけ。

## RandomAutoは作品概念に合う

公式文脈の「生成され続ける」「物化するたびに書き換わる」に対して、RandomAutoは自然に対応する。

ただし、完全ランダムに全値を飛ばすのではなく、重み付きランダム + ゆっくり補間 + 破綻回避が必要。

## EffectはMode横断

蛍/夜光虫/LEDの分類不能性を表す `LuminousSwarm` は、特定Mode固有ではなくEffectとして扱う。

ただし、Mode側がEffect強度の推奨値を持ってよい。

## preset命名

Reference:

```text
ref-deep-blue-universe-01
ref-pale-mineral-specimen-01
ref-magenta-green-cell-01
ref-blue-purple-vein-01
```

Original:

```text
orig-insect-orbitarium-01
orig-aurora-membrane-01
orig-cosmic-botanical-01
orig-blackhole-biotop-01
```

## 禁止事項

- 蒼氓蟲譜の説明文をそのまま画面に表示すること。
- 具象的な虫を描きすぎること。
- 黒円をModeごとに複製実装すること。
- LEDを単なるドットフィルタとして雑に乗せること。
- 自然/人工を明確に分けるUIにしすぎること。
- Autoを規則的な順番再生にすること。
