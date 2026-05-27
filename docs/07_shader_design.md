# 07. Shader設計

## 1. 目的

二号機では、巨大な単一fragment shaderにすべてを入れない。

ただし、最初から複雑なFBO多段構成にも進まない。MVPでは単一passを基本としつつ、shader sourceをchunkとvariantに分ける。

## 2. 推奨構造

```text
src/shaders/
├── common/
│   ├── fullscreen.vert.glsl
│   ├── math.glsl
│   ├── hash.glsl
│   ├── noise.glsl
│   ├── panel.glsl
│   ├── blackHoleField.glsl
│   ├── palettes.glsl
│   ├── move.glsl
│   ├── composition.glsl
│   ├── fireflies.glsl
│   ├── lighting.glsl
│   ├── postEffects.glsl
│   └── debugViews.glsl
├── variants/
│   ├── mineralFluid.frag.glsl
│   ├── deepUniverse.frag.glsl
│   ├── liquidCellular.frag.glsl
│   ├── veinBotanical.frag.glsl
│   └── oilMembrane.frag.glsl
└── buildShader.ts
```

## 3. common chunk

commonに置くもの:

- 数学関数。
- hash / noise / fbm。
- panelUv。
- blackHoleField。
- palette helper。
- move helper。
- composition mask。
- fireflies。
- lighting。
- post effects。
- debug view。

Mode固有variantに置くもの:

- 鉱物流体の模様。
- 宇宙の星雲。
- 細胞膜。
- 葉脈・枝。
- 黒油膜。

## 4. 描画パイプライン

```text
screenUv
  ↓
panelUv
  ↓
BlackHoleField計算
  ↓
patternUv = panelUv + lensWarp + orbitWarp
  ↓
MoveSystemで時間変化した座標を使う
  ↓
Compositionで出現範囲やレイヤー座標を決める
  ↓
active shader variantでPatternResult生成
  ↓
ColorSystemで色付け
  ↓
lighting / material補正
  ↓
FireflySystem
  ↓
photon ring / rim glow
  ↓
event horizon black composite
  ↓
optional post effects
  ↓
outColor
```

## 5. Variantのインターフェース

GLSLの実装都合により厳密なinterfaceは難しいが、考え方として次を守る。

```glsl
struct PatternResult {
  float height;
  float membrane;
  float glowMask;
  float darkMask;
  float colorMix;
};

PatternResult samplePattern(vec2 uv, vec2 panelUv, BlackHoleField field, float time);
```

実際にはvariantごとに `samplePattern` を定義し、build時にcommon mainへ差し込む形でもよい。

## 6. Uniform設計

MVPのuniform案:

```glsl
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_dpr;
uniform float u_renderScale;

uniform vec2 u_vortexPos[3];
uniform vec2 u_vortexVel[3];
uniform float u_vortexRadius[3];
uniform float u_vortexSpin[3];

uniform float u_speed;
uniform float u_panelAspect;
uniform float u_blackHoleGravity;
uniform float u_blackHoleSwirl;
uniform float u_photonRingStrength;
uniform float u_photonRingSpeed;
uniform float u_eventHorizonSoftness;

uniform vec4 u_paletteA;
uniform vec4 u_paletteB;
uniform vec4 u_paletteC;
uniform vec4 u_materialParams0;
uniform vec4 u_materialParams1;
uniform vec4 u_domainParams0;
uniform vec4 u_effectParams0;
uniform vec4 u_effectParams1;

uniform int u_debugView;
```

Mode固有の値が増えた場合でも、uniformの数を無秩序に増やしすぎない。`vec4` パックや `ResolvedUniformPayload` を使う。

## 7. ShaderProgramとUniformBinder

`ShaderProgram`:

- compile。
- link。
- error overlay。
- dispose。

`UniformBinder`:

- uniform location cache。
- 型に応じた送信。
- 配列uniformの送信。
- 未使用uniformがnullでも落とさない。

## 8. shader variant切替

MVPでは、active modeの `shaderVariant` に応じてprogramを選ぶ。

方針:

- 起動時に全variantをcompileしてもよい。
- または初回使用時にcompileしてcacheする。
- compile errorは画面に出す。
- variant切替時に状態が壊れないよう、uniform名はできるだけ共通にする。

## 9. Debug View

開発中に欲しいdebug view:

```text
0: final
1: panelUv
2: eventHorizonMask
3: photonRingMask
4: gravityLens magnitude
5: orbitWarp magnitude
6: height field
7: LED mask
8: firefly mask
```

GUIで切り替えられると調整が楽。

## 10. 注意

- GLSL chunk分割は構造のために使う。実行時の複雑な動的include機構を作りすぎない。
- Variantを増やしすぎる前に、Presetで解決できるか確認する。
- shader内のmagic numberは、可能な範囲でPreset paramsに逃がす。
- Event Horizonの黒塗りは最後に近い段階で行う。
- LED postは全Mode共通で最後に乗せる。
