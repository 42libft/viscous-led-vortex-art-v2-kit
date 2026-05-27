# 05. BlackHole / Vortex 仕様

## 1. 位置づけ

黒円は、この作品の共通主演です。

Modeごとの装飾ではなく、全Modeを貫く物理レイヤー・視覚レイヤーとして扱います。

```text
BlackHoleSystem
├── VortexPhysics      TypeScript側の位置・速度・接近・swap
├── BlackHoleField     shader側の重力レンズ・距離場
└── BlackHoleStyle     Mode/Presetごとの見た目調整
```

## 2. TypeScript側のVortex

```ts
export type Vortex = {
  id: number;
  position: Vec2;
  velocity: Vec2;
  radius: number;
  spin: number;
  pressure: number;
  swap?: VortexSwapState;
};

export type VortexSwapState = {
  pairId: number;
  center: Vec2;
  orbit: Vec2;
  startAngle: number;
  direction: number;
  elapsed: number;
  duration: number;
};
```

初期値は3つ固定でよい。

```text
v0: 上寄り
v1: 中央付近
v2: 下寄り
```

xは完全な一直線にしない。少し左右にずれることで、短冊内に生き物感が出る。

## 3. 物理仕様

### 3.1 通常移動

- ゆっくり漂う。
- 速度は完全ランダムではなく、滑らかに変わる。
- 黒円同士が画面内で偏りすぎない。
- 壁に近づいたら反射または押し戻し。

### 3.2 接近圧力

黒円同士が近づいた場合、即座に離すのではなく、少し押し合って圧力が溜まるようにする。

```text
dist < squeezeDist
  → pressure accumulates
  → mild repulsion

pressure > threshold
  → swap
```

### 3.3 swap

接近圧力が閾値を超えたら、2つの黒円が高速に位置を入れ替える。

要件:

- 突然teleportしない。
- 半周軌道のように見える。
- burst感がある。
- swap後はcooldownを設ける。

## 4. shader側のBlackHoleField

各黒円について、panelUvから次を計算する。

```glsl
struct BlackHoleField {
  vec2 lensWarp;
  vec2 orbitWarp;
  float eventHorizonMask;
  float photonRingMask;
  float gravityMask;
  float rimGlow;
  float influence;
};
```

GLSLでstructを使いづらい場合は、関数と戻り値を分けてもよい。

## 5. Event Horizon

中心の完全な黒。

```glsl
float eventHorizon = 1.0 - smoothstep(r * 0.38, r * 0.46, dist);
```

調整ポイント:

- `0.38` と `0.46` はMode/Presetで多少変えてよい。
- 中心は最終合成で黒くする。
- LEDやfireflyもevent horizon内では消える方がよい。

## 6. Photon Ring / Critical Rim

ぎりぎり外周で、模様が高速周回しているように見える帯。

```glsl
float ring = smoothstep(r * 0.48, r * 0.58, dist)
           * (1.0 - smoothstep(r * 0.74, r * 0.95, dist));
```

接線方向:

```glsl
vec2 radial = normalize(delta + 1e-5);
vec2 tangent = vec2(-radial.y, radial.x) * spin;
```

orbitWarp:

```glsl
float orbitSpeed = time * style.photonOrbitSpeed;
float swirl = sin(angle * style.photonAngularFreq + orbitSpeed);
vec2 orbitWarp = tangent * ring * style.photonRingWarp * (0.5 + 0.5 * swirl);
```

重要:

- 黒円本体が高速回転するのではなく、背景模様のサンプリング座標が淵で高速に回って見える。
- 中心ではなく、ぎりぎり外周に効かせる。
- これが「重力場の本当にギリギリ淵で模様が超高速に周回軌道している」感覚の本体。

## 7. Gravity Lens

黒円周辺の屈折。

```glsl
float gravity = exp(-dist * dist / (r * r * style.gravityFalloff));
vec2 lensWarp = radial * gravity * style.gravityStrength;
```

方向は単純なradialだけでなく、Modeによって少し接線方向を混ぜてよい。

```glsl
lensWarp += tangent * gravity * style.swirlStrength;
```

## 8. 複数黒円の合成

3つの黒円それぞれからfieldを計算し、合成する。

```glsl
vec2 totalLensWarp = vec2(0.0);
vec2 totalOrbitWarp = vec2(0.0);
float eventMask = 0.0;
float ringMask = 0.0;
float gravityMask = 0.0;

for each blackHole:
  totalLensWarp += field.lensWarp;
  totalOrbitWarp += field.orbitWarp;
  eventMask = max(eventMask, field.eventHorizonMask);
  ringMask = max(ringMask, field.photonRingMask);
  gravityMask = max(gravityMask, field.gravityMask);
```

## 9. 合成順序

推奨する描画順序:

```text
panelUv
  ↓
BlackHoleField計算
  ↓
patternUv = panelUv + lensWarp + orbitWarp
  ↓
PatternModeで模様生成
  ↓
Effect適用
  ↓
Photon Ring / rimGlow追加
  ↓
Event Horizonで黒くする
  ↓
LED post / vignette
```

Event Horizonを早く塗りすぎると、周辺の歪みが効かない。黒塗りは最終合成に近い場所で行う。

## 10. BlackHoleStyle

```ts
export type BlackHoleStyleParams = {
  coreScale: number;
  coreSoftness: number;
  gravityStrength: number;
  gravityFalloff: number;
  swirlStrength: number;
  photonRingStrength: number;
  photonRingWarp: number;
  photonOrbitSpeed: number;
  photonAngularFreq: number;
  rimGlow: number;
  rimColorBias: Vec3;
};
```

Modeごとの傾向:

- `ref-deep-blue-universe`: gravityStrength高め、photonRing強め、rimGlow青白。
- `ref-pale-mineral`: coreは強いがrimは控えめ、重力はやや柔らかい。
- `ref-magenta-green-cell`: orbitWarp強め、rimGlowは色付き。
- `ref-blue-purple-vein`: lensWarpで枝や葉脈を曲げることを重視。

## 11. デバッグ表示

開発中は以下を切り替えられるとよい。

- eventHorizonMaskだけ表示。
- photonRingMaskだけ表示。
- gravityMaskだけ表示。
- lensWarpの大きさを色で表示。
- orbitWarpの方向を色で表示。

GUIには `debugBlackHoleField` を置いてよい。
