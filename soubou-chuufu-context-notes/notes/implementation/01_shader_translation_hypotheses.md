# shader翻訳仮説

このファイルは、蒼氓蟲譜の文脈を二号機のshader設計へ落とすための仮説集。

## 1. 分類不能な光

公式文脈では、蛍・夜光虫・LEDが同じ頁に記され、自然光と都市光の分類が失敗する。

shader方針:

- 発光粒は firefly / marine bioluminescence / LED noise / star の中間にする。
- 粒のサイズ、色、滲み、点滅周期をばらつかせる。
- 一部はLED格子に固定され、一部は有機的に流れる。

実装候補:

```glsl
vec3 luminousSwarm(vec2 uv, float time, SwarmParams p);
```

## 2. 蟲譜 / 標本帖

作品は生物分類のようで、分類不能でもある。

shader方針:

- パネル内に有機的な膜、翅、細胞境界、葉脈を出す。
- 過度に具象的な虫を描かない。
- 「虫っぽい」「標本っぽい」構造だけを抽出する。

実装候補:

```glsl
float membrane = warpedVoronoi(...);
float vein = branchingField(...);
float wingFilm = thinFilmInterference(...);
```

## 3. 光柱

作品は4メートルの光柱として語られる。

shader方針:

- 短冊パネルを絶対に崩さない。
- パネル外を暗く保つ。
- パネル内の上端/下端に弱いビネットや輝度落ちを持たせる。
- 垂直方向の流れを基本にする。

実装候補:

```glsl
PanelSample panel = samplePanel(screenUv, resolution);
if (!panel.inside) return outerDarkness(...);
```

## 4. ブラックホール黒円

ユーザー観察では、黒円はブラックホール的に見える。

shader方針:

- `blackHoleField.glsl` を共通chunkにする。
- PatternModeは黒円を直接持たない。
- lensWarpとorbitWarpをPatternサンプリング前に適用する。
- event horizonはPattern後に最終合成する。

実装候補:

```glsl
BlackHoleField bh = sampleBlackHoleField(panelUv, vortices, time);
vec2 patternUv = panelUv + bh.lensWarp + bh.orbitWarp;
vec3 pattern = samplePattern(patternUv, time, params);
vec3 finalColor = composeBlackHole(pattern, bh, params);
```

## 5. Liquid Universe系の流動性

Liquid Universeシリーズ文脈では、万物の変化、物化、流動する宇宙が重要。

shader方針:

- Modeは固定ジャンルではなく、複数質感の混成にする。
- cellular / liquid / oil / universe を別Modeにしつつ、EffectやPresetで交差可能にする。
- Autoは固定順序ではなく、重み付きランダム遷移にする。

## 6. LED粒と有機膜の同居

LEDは人工物性を持つが、本作では自然の発光体と同じ頁に置かれる。

shader方針:

- LED gridは最終postprocessとして全Modeにかける。
- ただし強度はMode / Presetで変えられる。
- LED dotの下に有機的な膜を見せる。
- scanlineやgrid lineは強すぎない。

## 7. Reference / Original を同じ構造で扱う

shader方針:

- `PatternMode` は生成アルゴリズム。
- `PatternPreset` は値のセット。
- `origin: reference | original` はメタデータ。
- shader variantを増やしすぎず、presetで見た目を増やす。

## 優先実装順

1. Panel / outer darkness
2. VortexSystem
3. BlackHoleField
4. DeepBlueUniverse pattern
5. LED / luminousSwarm
6. Cellular / membrane pattern
7. RandomAutoDirector
8. Reference presets
9. Original presets
