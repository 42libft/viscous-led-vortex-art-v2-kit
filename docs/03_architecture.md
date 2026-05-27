# 03. プログラム全体構造

## 1. 設計思想

二号機は、ひとつの巨大shader作品ではなく、小さな作品レンダリングエンジンとして作る。

ただし、制作ツールではありません。UIや保存機能を肥大化させず、作品を描くための構造をきれいに保ちます。

## 2. 推奨リポジトリ構造

```text
viscous-led-vortex-art-v2/
├── docs/
├── visual-references/                 # 資料置き場。実行時assetではない
├── public/
├── src/
│   ├── main.ts                        # createAppしてstartするだけ
│   ├── app/
│   │   ├── createApp.ts
│   │   ├── frameLoop.ts
│   │   └── lifecycle.ts
│   ├── display/
│   │   ├── panel.ts
│   │   └── viewport.ts
│   ├── renderer/
│   │   ├── WebGLRenderer.ts
│   │   ├── ShaderProgram.ts
│   │   ├── UniformBinder.ts
│   │   ├── shaderRegistry.ts
│   │   └── resizeCanvas.ts
│   ├── simulation/
│   │   ├── VortexSystem.ts
│   │   ├── vortexPhysics.ts
│   │   └── vortexTypes.ts
│   ├── patterns/
│   │   ├── PatternRegistry.ts
│   │   ├── patternTypes.ts
│   │   ├── referenceModes.ts
│   │   ├── originalModes.ts
│   │   └── presets/
│   │       ├── referencePresets.ts
│   │       └── originalPresets.ts
│   ├── colors/
│   │   ├── colorTypes.ts
│   │   └── colorResolver.ts
│   ├── motion/
│   │   ├── moveTypes.ts
│   │   └── moveResolver.ts
│   ├── composition/
│   │   ├── compositionTypes.ts
│   │   └── compositionResolver.ts
│   ├── fireflies/
│   │   ├── fireflyTypes.ts
│   │   └── fireflyResolver.ts
│   ├── effects/
│   │   ├── effectTypes.ts
│   │   ├── effectRegistry.ts
│   │   ├── glow.ts
│   │   ├── specular.ts
│   │   ├── grain.ts
│   │   └── scanline.ts
│   ├── settings/
│   │   ├── defaultSettings.ts
│   │   ├── settingsSchema.ts
│   │   ├── presetResolver.ts
│   │   └── RandomAutoDirector.ts
│   ├── ui/
│   │   ├── gui.ts
│   │   ├── appButtons.ts
│   │   └── debugPanel.ts
│   ├── shaders/
│   │   ├── common/
│   │   └── variants/
│   └── styles/
│       └── style.css
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 3. 起動フロー

```text
index.html
  ↓
src/main.ts
  ↓
createApp()
  ↓
canvas取得
  ↓
WebGLRenderer作成
  ↓
PatternRegistry / EffectRegistry / Settings作成
  ↓
VortexSystem作成
  ↓
GUI作成
  ↓
frameLoop.start()
```

`main.ts` の理想形:

```ts
import { createApp } from './app/createApp';
import './styles/style.css';

const app = createApp({ canvasId: 'gl' });
app.start();
```

## 4. 毎フレームの処理

```text
frame(now)
  ↓
dt計算
  ↓
viewport / canvas resize
  ↓
RandomAutoDirector.update(dt)
  ↓
VortexSystem.update(dt)
  ↓
settings + activePreset + color + move + composition + firefly + vortexState を uniform params に解決
  ↓
renderer.draw(frameParams)
  ↓
requestAnimationFrame
```

## 5. モジュール責務

### 5.1 app

アプリの起動、停止、フレームループ、ライフサイクルを担当する。

持たないもの:

- shader中身。
- 黒円物理の詳細。
- Mode定義。
- GUI項目の詳細。

### 5.2 display

短冊パネル、viewport、DPR、renderScale、safe areaなどを扱う。

TypeScript側でpanel layoutを計算するか、shader側の `panelUv` に寄せるかは実装で選ぶ。ただし全Mode共通であること。

### 5.3 renderer

WebGL2の初期化、shader compile/link、program切替、uniform更新、drawを担当する。

`renderer` はModeの意味を知らなくてよい。`shaderVariant` と `uniform payload` を受け取り、描画する。

### 5.4 simulation

3つの黒円の物理状態を更新する。

担当:

- 位置。
- 速度。
- 壁反射。
- 近接圧力。
- swap。
- 半径。
- spin。

担当しないもの:

- GLSL上のPhoton Ring。
- 模様生成。
- GUI。

### 5.5 patterns

Pattern、Preset、family、origin、shaderVariantを管理する。

担当:

- Reference Mode定義。
- Original Mode定義。
- Preset定義。
- Preset検索。
- ModeとPresetの整合性検証。

### 5.6 colors

メイン色と配色ルールを管理する。

担当:

- `mainColor`。
- `colorScheme`。
- palette生成。
- Reference / Originalの色出所管理。

### 5.7 motion

背景模様の動きを管理する。

担当:

- Move intensity。
- Move program。
- Base Move。
- Triggered Move。
- Transition Move。

担当しないもの:

- 黒円への巻き込み。
- VortexSystemの物理。

### 5.8 composition

Patternをどこに出すかを管理する任意カテゴリ。

担当:

- `randomSpot`。
- `bottomBloom`。
- `edgeOverflow`。
- `depthLayers`。
- seed付きランダム位置。

### 5.9 fireflies

白い発光点を共通レイヤーとして管理する。

担当:

- 密度。
- 明るさ。
- またたき。
- Event Horizon内で消えるためのmask連携。

### 5.10 effects

Modeをまたいで使えるEffectの定義を管理する。

TypeScript上ではEffect Paramsを定義し、shader上では `lighting.glsl` や `postEffects.glsl` に実装する。

Effectは補助質感だけを扱う。FireflySystemやBlackHoleStyleの代替にしない。

### 5.11 settings

ユーザー設定、初期値、GUIで変更可能な値、Autoの状態を管理する。

`RandomAutoDirector` もここに置く。

### 5.12 ui

lil-gui、右下ボタン、debug表示を担当する。

UIはsettingsを更新するだけで、rendererやsimulationを直接いじらない。

## 6. 依存方向

望ましい依存方向:

```text
main
  → app
      → renderer
      → simulation
      → patterns
      → colors
      → motion
      → composition
      → fireflies
      → effects
      → settings
      → ui
```

禁止したい依存:

```text
simulation → ui
renderer → ui
patterns → rendererの実装詳細
shader chunks → TypeScriptのruntime実装
```

## 7. データモデル概要

```ts
type AppState = {
  settings: RuntimeSettings;
  activeModeId: string;
  activePresetId: string;
  auto: AutoState;
  vortices: VortexState[];
};

type FrameParams = {
  time: number;
  dt: number;
  viewport: ViewportState;
  settings: ResolvedSettings;
  pattern: ResolvedPattern;
  color: ResolvedColor;
  move: ResolvedMove;
  composition?: ResolvedComposition;
  fireflies: ResolvedFireflySystem;
  effects: ResolvedEffects;
  vortices: VortexUniformPayload;
};
```

`ResolvedPattern` は、Mode + Preset + Auto補間結果をまとめたもの。rendererには解決済みの値だけを渡す。

## 8. エラー処理

- WebGL2非対応時は画面に明確なメッセージを出す。
- shader compile errorはconsoleだけでなく画面にも出す。
- PresetのmodeId不一致は起動時に検出する。
- unknown mode / presetはdefaultへfallbackする。

## 9. 重要な設計ルール

- `main.ts` は薄く保つ。
- Modeを足すときにrendererを改造しない。
- Effectを足すときにModeを全改造しない。
- 黒円の物理をModeごとにコピーしない。
- Autoのランダム性を削らない。
- Visual reference素材を実行時assetにしない。
