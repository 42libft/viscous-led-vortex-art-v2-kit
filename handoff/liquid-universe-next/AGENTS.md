# AGENTS.md - Liquid Universe Next

このプロジェクトの目的は、蒼氓蟲譜を模倣し続けることではない。Liquid Universeという概念を、自分の作品として実装すること。

## 最重要方針

- `main.ts` を薄い入口に保つ。
- shader、renderer、simulation、settings、patterns、effects、uiを分離する。
- 固定短冊ではなく、変化する枠を `LiquidFrameSystem` として一級モジュールにする。
- 黒円は各Patternに埋め込まず、全体共通の `BlackHole / VortexSystem` として扱う。
- Patternは模様生成に集中する。
- Color、Move、Frame、Composition、FireflySystem、EffectをPatternから分離する。
- Moveは背景模様の動き、Frameは枠の変形、Vortexは黒円への巻き込みとして分ける。
- 白い点々はEffectではなく共通 `FireflySystem` として扱う。
- EffectはModeから独立した補助的な後処理・質感処理として扱う。
- Autoは固定順序ではなく、重み付きランダム遷移を基本にする。
- MVPでは録画、投稿、タイムライン編集、外部入力、展示運用機能を作らない。

## 模倣開発から持ち越さないもの

- 旧Reference Modeを完成目標にしない。
- `ref-*` の見た目を次作の正解にしない。
- 本家素材や参照フォルダー内の素材をWeb配信対象にしない。
- 短冊形状を唯一の作品枠にしない。
- 「似ているかどうか」を評価基準にしない。

## 次作の判断基準

構造で迷ったら、次の順で優先する。

1. LiquidFrameSystemがPatternから分離されているか。
2. Pattern、Color、Move、Frame、Composition、FireflySystem、Effectが混ざっていないか。
3. 黒円のブラックホール表現が共通システムに残っているか。
4. 旧Reference Modeへの依存が増えていないか。
5. MVPの範囲を超えて制作ツール化していないか。
6. 実装後に見た目の調整余地が残るか。

見た目で迷ったら、参照作品に似せるのではなく、Liquid Universeの概念に戻る。Liquidは「固定された境界が信頼できなくなる状態」である。

## 推奨する最初のPhase

1. `Panel` を `LiquidFrameSystem` へ置き換える。
2. `frameUv`, `frameMask`, `frameEdge` を全shader共通で使えるようにする。
3. 黒円を共通VortexSystemのまま表示する。
4. 旧Reference Modeを初期Autoから外す。
5. 独自Pattern ecosystemを1つ作る。
6. RandomAutoDirectorにFrame stateも遷移対象として渡せるようにする。

各Phase完了時には、以下を確認する。

- TypeScript buildが通る。
- 画面が表示される。
- `main.ts` が薄い入口のまま。
- 新しい責務が適切なフォルダーに置かれている。
- 変更理由がdocsに残っている。
