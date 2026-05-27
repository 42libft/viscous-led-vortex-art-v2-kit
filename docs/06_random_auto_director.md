# 06. RandomAutoDirector 仕様

## 1. 目的

Autoは固定順序のプレイリストではありません。

次の状態がランダムに選ばれることによって、ライブ感、偶然性、展示物としての呼吸が生まれます。二号機では、このランダム性を仕様として守ります。

## 2. 基本方針

```text
RandomAutoDirector:
現在状態を保持し、一定時間ごとに次の状態を重み付きランダムで選び、
補間可能な値をゆっくり遷移させる。
```

## 3. 選択対象

Autoが選ぶ対象:

- PatternPreset。
- ColorParams。
- MoveParams。
- CompositionParams。
- FireflyParams。
- MaterialParams。
- EffectParams。
- BlackHoleStyleParams。

Autoが直接いじらない対象:

- renderer実装。
- VortexSystemの物理アルゴリズム。
- GUI構造。
- shader chunk構造。

## 4. ランダム選択のルール

### 4.1 重み付きランダム

各Presetは `autoWeight` を持てる。

```ts
type AutoCandidate = {
  presetId: string;
  weight: number;
  tags: string[];
  shaderVariant: ShaderVariant;
  origin: PatternOrigin;
};
```

`weight <= 0` のPresetはAuto候補にしない。

### 4.2 連続回避

避けるもの:

- 同じpresetIdの連続。
- 同じfamilyの連続が長すぎること。
- 暗いPresetが何回も続くこと。
- 極端に明るいPresetが何回も続くこと。

ただし、完全に禁止しすぎるとランダム感が消える。履歴は直近2〜3個でよい。

### 4.3 Reference / Original比率

MVPでは、Referenceを多めにしてよい。

例:

```text
reference: 70%
original: 30%
```

Originalが増えたら比率を調整する。

### 4.4 ShaderVariantの扱い

同じshaderVariant内のPreset遷移は、値補間しやすい。

異なるshaderVariantへの遷移は、無理に全値補間しない。

候補:

- epoch境界で切り替える。
- 切替前後にglowや暗転を少し入れる。
- 将来FBO crossfadeを追加する。

MVPでは、Variant切替時に多少のジャンプを許容してよい。ただしランダムAutoのライブ感を壊さないこと。

## 5. 時間設計

推奨値:

```text
holdDuration: 18〜34秒
transitionDuration: 8〜20秒
```

現行一号機のようにゆっくりランダム値へ補間する感覚は維持する。

```ts
type AutoTiming = {
  holdSecondsMin: number;
  holdSecondsMax: number;
  transitionSecondsMin: number;
  transitionSecondsMax: number;
};
```

## 6. 状態定義

```ts
export type AutoState = {
  enabled: boolean;
  currentPresetId: string;
  targetPresetId: string | null;
  phase: 'hold' | 'transition';
  elapsed: number;
  duration: number;
  history: string[];
  seed: number;
};
```

## 7. 補間対象

補間してよいもの:

- paletteの色係数。
- mainColor / colorSchemeの範囲内変化。
- Move intensity。
- Move programのうち同一shaderVariant内で破綻しないもの。
- Compositionのseed、位置、強度。
- FireflySystemの密度、明るさ、またたき。
- materialの強度。
- domain warp量。
- glow強度。
- blackHoleStyleの強度。

補間しない方がよいもの:

- shaderVariant。
- Mode ID。
- GLSL構造。
- array長。
- 物理アルゴリズム。

Transition時だけ有効にしてよいもの:

- `transitionShake`。
- `oilTremor` の激化。
- 一時的なglow増加。

## 8. 疑似コード

```ts
class RandomAutoDirector {
  update(dt: number): ResolvedAutoBlend {
    if (!this.state.enabled) return this.resolveManual();

    this.state.elapsed += dt;

    if (this.state.elapsed >= this.state.duration) {
      if (this.state.phase === 'hold') {
        this.beginTransition();
      } else {
        this.finishTransition();
      }
    }

    return this.resolveBlend();
  }

  private beginTransition() {
    const next = this.pickNextPresetWeightedRandom();
    this.state.targetPresetId = next.id;
    this.state.phase = 'transition';
    this.state.elapsed = 0;
    this.state.duration = randomRange(8, 20);
  }

  private finishTransition() {
    this.state.currentPresetId = this.state.targetPresetId!;
    this.state.targetPresetId = null;
    this.state.phase = 'hold';
    this.state.elapsed = 0;
    this.state.duration = randomRange(18, 34);
  }
}
```

## 9. 乱数

完全な `Math.random()` でもMVPは成立するが、seed付き乱数にすると良い状態を再現しやすい。

推奨:

- `mulberry32` などの軽量seeded random。
- URL queryで `?seed=123` を受け取れるようにする。
- GUIにseed再生成ボタンを置いてもよい。

## 10. GUI項目

- `Auto enabled`
- `Auto speed`
- `Reference / Original balance`
- `Hold min/max`
- `Transition min/max`
- `Next random now`
- `Lock current mode`

ただしGUIを増やしすぎるとCに近づく。MVPでは最低限でよい。

## 11. 合格条件

- Autoが固定順序ではない。
- 次のPresetがランダムに選ばれる。
- 同じPresetが連続しない。
- Auto中でも作品の世界観が保たれる。
- `RandomAutoDirector` がrendererやshader詳細に依存しない。
