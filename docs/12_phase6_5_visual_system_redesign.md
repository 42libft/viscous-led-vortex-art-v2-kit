# 12. Phase 6.5 Visual System Redesign

Phase 6の途中で、旧設計の `Mode / Preset / Effect` だけでは、二号機が再び「何をどう調整しているのか分からない巨大Mode」へ戻る危険が見えた。

この文書を、Phase 6以降の見た目実装における新しい基準とする。

## 1. 再設計の目的

目的:

- Modeに模様、色、動き、白い点、配置、質感を全部詰め込まない。
- 本家ReferenceとVersion 1由来Originalを同じ仕組みに載せつつ、出所は混ぜない。
- リアルタイム生成で、Preset状態と一期一会のRandom状態の両方を扱えるようにする。
- 動きの静けさ、激しさ、特殊演出を一級の設計対象にする。

## 2. 新しい分解

```text
VisualState
├── Pattern              何の模様か
├── Color                何色系か
├── Move                 どう動くか
├── Composition?         どこに出るか、必要なときだけ
├── FireflySystem        ほぼ常在する白い発光点
├── Effects?             補助質感、必要なときだけ
├── Vortex / BlackHole   3つの黒円、不変の共通システム
└── Director             Preset / Random / Transitionを選ぶ
```

旧 `Mode` は、この全体を抱え込まない。  
今後の `PatternMode` は「模様生成アルゴリズム」に寄せ、Color / Move / Composition / Firefly / Effectは別パラメータとして扱う。

## 3. Pattern

Patternは、何が描かれるかを決める。

例:

- mineral
- universe
- cellular
- vein
- oil membrane
- botanical
- insect specimen

Patternが担当するもの:

- 細胞膜の形。
- 鉱物の境界。
- 宇宙雲の密度。
- 葉脈や枝の線。
- 油膜の黒い流路。

Patternが担当しないもの:

- 白い発光点。
- 色パレットの最終決定。
- 全体の動きの激しさ。
- 黒円への巻き込み。
- Preset遷移演出。

## 4. Color

Colorは超重要な独立カテゴリとして扱う。

```ts
type MainColor =
  | 'blue'
  | 'red'
  | 'yellow'
  | 'green'
  | 'white'
  | 'purple'
  | 'pink';

type ColorScheme =
  | 'sameFamily'       // メイン色と同系色
  | 'sameFamilyBlack'  // 同系色 + 黒
  | 'accentColor'      // メインと少し違う差し色
  | 'contrast';        // かなり違う色も混ぜる
```

Colorが担当するもの:

- メイン色。
- 同系色の範囲。
- 黒を混ぜるか。
- 差し色を混ぜるか。
- コントラストの強さ。

PatternとColorは分ける。  
同じPatternでも、青系、白系、黒緑系、橙鉱物系へ変えられるようにする。

## 5. Move

Moveは、背景模様がどう動くかを決める一級カテゴリ。

黒円への巻き込みはMoveではなく、Vortex / BlackHoleFieldが担当する。

### 5.1 共通の激しさ

```ts
type MoveIntensity =
  | 'calm'
  | 'normal'
  | 'active'
  | 'violent';
```

役割:

- `calm`: 波のように静か。
- `normal`: ゆっくり流れる。
- `active`: 方向性やうねりが明確。
- `violent`: 振動、脈動、切替前の高まり。

### 5.2 Move Program

```ts
type MoveProgram =
  | 'stillBreath'
  | 'directionalFlow'
  | 'counterFlowLayers'
  | 'cellularPulse'
  | 'oilTremor'
  | 'transitionShake';
```

例:

- `directionalFlow`: 右から左、または左から右へ模様が流れる。
- `counterFlowLayers`: 奥と手前のレイヤーが逆方向に流れる。
- `cellularPulse`: Cellular系でポコポコ脈動する。
- `oilTremor`: Version 1で良かった振動をOriginal Moveとして採用する。
- `transitionShake`: 切替直前に小刻みに振動してシーンが変わる。

### 5.3 特殊条件下のMove

Moveには通常状態と特殊状態がある。

```text
Base Move:
  いつも効いている流れ・波・漂い

Triggered Move:
  Pattern条件、Composition条件、Auto遷移条件で発動

Transition Move:
  Preset切替時だけ発動
```

例:

- Cellular Patternのときだけ `cellularPulse` が発動する。
- Auto遷移直前だけ `transitionShake` が発動する。
- Compositionが `depthLayers` のときだけ `counterFlowLayers` が有効になる。

## 6. Composition

Compositionは、Patternをどこに出すかを決める。  
ただし、全Mode必須ではない。必要なときだけ使う任意カテゴリ。

```ts
type CompositionMode =
  | 'none'
  | 'full'
  | 'randomSpot'
  | 'bottomBloom'
  | 'edgeOverflow'
  | 'depthLayers';
```

役割:

- `none`: 特別な配置制御なし。
- `full`: Patternが全面に出る。
- `randomSpot`: ワンポイントでランダムに湧く。
- `bottomBloom`: 下の方だけ細胞や油膜が湧く。
- `edgeOverflow`: 端から黒油膜や色が溢れる。
- `depthLayers`: 奥と手前の2層を持ち、異なるMoveを使える。

ワンポイントはPreset固定ではなく、seed付きRandomで位置やサイズを決める。

## 7. FireflySystem

白い点々はEffectではなく、作品共通のFireflySystemとして扱う。

特徴:

- ほぼ全Modeに存在する。
- 白〜淡色の小さな発光点。
- 蛍の光、星、反射、露のように見える。
- Event Horizon内では消える。
- 黒円の周囲ではGravity Lensの影響を受けてもよい。

FireflySystemは、Patternと独立してON/OFFや密度調整できる。  
ただし「常在する作品の呼吸」として、完全なEffect扱いにはしない。

## 8. Effects

Effectは補助的な質感だけを扱う。多くなくてよい。

採用候補:

- `glow`: 全体のにじみ。
- `specular`: 濡れた膜、油、ガラスの反射。
- `grain`: 微細な粒状感。
- `scanline`: 必要な場合だけ使う特殊質感。

削除または降格候補:

- `ledGrid`: 黒い方眼は撮影由来の可能性が高く、作品表現としては優先しない。
- `fireflies`: EffectではなくFireflySystemへ移す。
- `vortexRing`: EffectではなくBlackHoleStyleへ寄せる。

## 9. Vortex / BlackHole

Vortexは不変の共通システム。

担当:

- 3つの黒円の位置。
- 接近圧力。
- swap。
- Event Horizon。
- Photon Ring。
- Gravity Lens。
- 黒円への巻き込み。

Moveは黒円への巻き込みを担当しない。  
Pattern / Color / Move / Composition / Firefly / Effectのすべては、最終的に共通BlackHoleFieldで歪められる。

## 10. Preset / Random / Director

理想の進行:

```text
Preset
→ Preset
→ Random
→ Preset
→ Random
→ Preset
```

Preset:

- 良い状態を保存したもの。
- Pattern / Color / Move / Composition / Firefly / Effect / BlackHoleStyleを固定または範囲指定する。

Random:

- PatternやColor、Moveなどを重み付きで一期一会に選ぶ。
- 完全無秩序ではなく、破綻しない組み合わせだけを選ぶ。

Director:

- Preset表示。
- Random生成。
- hold / transition。
- Transition Moveの発動。
- shaderVariant切替時の扱い。

## 11. 並列開発の責務境界

並列開発するときは、同じファイルを複数スレッドで触らない。

おすすめ分担:

| 担当 | 触ってよい範囲 | 触らない範囲 |
| --- | --- | --- |
| Spec Redesign | `docs/` | `src/`, `README.md`, `visual-references/`, `package*.json` |
| Color System | `src/colors/` | Preset採用、GUI、shader variant |
| Move System | `src/motion/`, `src/shaders/common/move.glsl` | Vortex / BlackHoleField、Preset採用 |
| Composition | `src/composition/`, `src/shaders/common/composition.glsl` | Pattern shader本体、Preset採用 |
| FireflySystem | `src/fireflies/`, `src/shaders/common/fireflies.glsl` | Effect、BlackHoleStyle、Pattern shader本体 |
| Effect System | `src/effects/`, `src/shaders/common/effects.glsl` | FireflySystem、BlackHoleStyle、Pattern shader本体 |
| Pattern Shaders | `src/shaders/variants/` | 共通chunk、GUI、Auto |
| Integration | `src/patterns/`, `src/settings/`, `src/renderer/`, `src/ui/`, `src/app/` | 各専門担当の実験値を無断採用しない |

`Spec Redesign` だけを依頼された場合、README更新も含めない。READMEはPhase 10、または明示的にREADME更新を依頼されたときに扱う。

## 12. 直近の実装順

Phase 6.5は、先に仕様を整えてからコードへ進む。

1. Spec Redesign: `docs/` をこの分類へ更新し、責務境界と未決事項を同期する。
2. Type / Data: 型に `ColorParams`, `MoveParams`, `CompositionParams`, `FireflyParams` を追加する。
3. Preset Migration: 既存Presetを新分類へ移行する。
4. Shader Separation: Deep Blue内の白い点、LED風処理、背景色、flowを分離する。
5. FireflySystem: 白い点々を共通化する。
6. GUI / Tuning: Move intensityとMove programをGUIで確認できるようにする。
