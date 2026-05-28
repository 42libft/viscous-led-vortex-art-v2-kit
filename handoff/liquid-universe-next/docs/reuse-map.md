# Reuse Map

## 1. そのまま移植する

| 領域 | ファイル | 理由 |
| --- | --- | --- |
| App shell | `src/main.ts`, `src/app/` | 薄い入口、起動、frame loop、error overlayは次作でも有効。 |
| Renderer | `src/renderer/` | WebGL2、fullscreen triangle、shader program管理を再利用できる。 |
| Shader build | `src/shaders/buildShader.ts` | common chunk + variant方式を維持できる。 |
| Vortex | `src/simulation/` | 黒円の漂い、接近圧力、swapを次作の核にできる。 |
| BlackHole shader | `src/shaders/common/blackHoleField.glsl` | Event HorizonとGravity Lensを共通化できている。 |
| Firefly | `src/fireflies/`, `src/shaders/common/fireflies.glsl` | 白い点々をPatternから分離したまま使える。 |
| Effects | `src/effects/`, `src/shaders/common/effects.glsl` | 補助質感をModeから分離できている。 |
| Alife hooks | `src/shaders/common/alife.glsl` | 人工生命風の変調を次作へ広げる入口になる。 |
| Auto | `src/settings/RandomAutoDirector.ts` | 固定順序ではない重み付きランダム遷移として流用できる。 |

## 2. 改名して移植する

| 現在 | 次作候補 | 変更内容 |
| --- | --- | --- |
| `display/panel.ts` | `display/frame.ts` | 固定短冊から変化する枠へ拡張する。 |
| `panel.glsl` | `liquidFrame.glsl` | `panelUv` ではなく `frameUv`, `frameMask`, `frameEdge` を返す。 |
| `PatternOrigin` | `Lineage` または `EcosystemType` | `reference/original` の対立を捨てる。 |
| `Composition` | `Composition` + `Frame` | 模様の配置と枠の変形を分ける。 |
| `PatternMode` | `PatternEcosystem` | 模倣Modeではなく、独自生態系として扱う。 |

## 3. サンプルとしてだけ読む

| 領域 | 扱い |
| --- | --- |
| `src/shaders/variants/deepUniverse.frag.glsl` | 星、暗い筋、発光粒の作例として読む。 |
| `src/shaders/variants/mineralFluid.frag.glsl` | 鉱物膜、セル輪郭の作例として読む。 |
| `src/shaders/variants/liquidCellular.frag.glsl` | 出所未確定系の実験として読む。正解扱いしない。 |
| `src/patterns/presets/referencePresets.ts` | Preset型の書き方だけ参考にする。見た目は引き継がない。 |

## 4. 捨てる

- Reference Modeを増やして再現精度を上げる計画。
- 旧 `ref-*` の命名。
- 蒼氓蟲譜に似ているかどうかの評価軸。
- 参照素材を実行時assetとして使う発想。
- 固定短冊しか描けない前提。

## 5. 次作で最初に追加する型

```ts
export type FrameProgram =
  | 'stillPanel'
  | 'breathingRect'
  | 'liquidWindow'
  | 'splitCells'
  | 'membraneTear'
  | 'orbitalAperture';

export type FrameParams = {
  program: FrameProgram;
  seed: number;
  softness: number;
  drift: number;
  rupture: number;
  multiplicity: number;
};
```

## 6. 次作で最初に追加するshader contract

```glsl
struct LiquidFrame {
  vec2 uv;
  float mask;
  float edge;
  float id;
};

LiquidFrame resolveLiquidFrame(vec2 screenUv, float time, vec4 frameParams0, vec4 frameParams1);
```

このcontractを先に作ると、Pattern shaderは「画面全体」ではなく「変化する枠の内側」に集中できる。
