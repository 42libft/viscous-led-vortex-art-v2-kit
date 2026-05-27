# Reference Mode と Original Mode の観察基準

## Reference Mode

本家の特定ビジュアルを観察し、近い状態を出すためのMode / Preset。

Reference Modeの目的は、公式画像やユーザー撮影素材に近い瞬間を再構成すること。ただし完全コピーではなく、構造的な特徴を抽出して再現する。

候補:

- `ref-deep-blue-universe`
  - 深い青、星雲、夜光虫、ブラックホールの相性が高い。
- `ref-pale-mineral-specimen`
  - 白地・淡色・標本・鉱物・発光膜。
- `ref-magenta-green-cell`
  - 細胞膜、ピンク緑、濁った有機性。
- `ref-blue-purple-vein`
  - 青紫、葉脈、神経、血管、虫の翅。
- `ref-black-oil-liquid`
  - 黒油膜、虹色、液体、重力レンズ。

## Original Mode

本家の構造を借りつつ、自分たちの発明として展開するMode / Preset。

Original Modeでは、公式文脈の「分類不能性」を守りながら、より自由な発光生態系を作ってよい。

候補:

- `orig-insect-orbitarium`
  - 黒円を虫の眼点と星系の重力点の中間として扱う。
- `orig-aurora-membrane`
  - オーロラ、細胞膜、夜光虫の群れ。
- `orig-cosmic-botanical`
  - 宇宙と植物の葉脈が混ざる。
- `orig-blackhole-biotop`
  - ブラックホール周辺に発光生物が集まる。

## 分類上の注意

Reference / Original は実装管理上の分類であり、shaderの内部構造を分けすぎない。

同じ PatternMode / Preset / Effect 型で扱うこと。

Referenceで偶然生まれた良い見た目は、Original Presetとして派生させてよい。

Originalで本家に近づいた見た目は、Reference候補として観察メモに戻してよい。
