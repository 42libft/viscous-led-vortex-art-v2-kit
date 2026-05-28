# AGENTS.md — 二号機実装エージェントへの指示

このプロジェクトの目的は、現行一号機を継ぎ足すことではなく、二号機をゼロから整理された構造で作ることです。

## 最重要方針

- `main.ts` を巨大化させない。
- shader、renderer、simulation、settings、patterns、effects、uiを分離する。
- 黒円は各Modeに埋め込まず、全Mode共通の `BlackHole / VortexSystem` として扱う。
- Pattern Modeは模様生成に集中させる。
- Color、Move、Composition、FireflySystem、EffectをPatternから分離する。
- Moveは背景模様の動き、Vortexは黒円への巻き込みとして分ける。
- 白い点々はEffectではなく共通 `FireflySystem` として扱う。
- EffectはModeから独立した補助的な後処理・質感処理として扱う。
- Autoは固定順序ではなく、重み付きランダム遷移を基本にする。
- C、つまり制作ツール化、録画、投稿、タイムライン編集、外部入力、展示運用機能はMVPでは作らない。

## 実装時の禁止事項

- 1つの巨大fragment shaderにすべてを押し込まない。
- `src/main.ts` にGUI、物理、shader文字列、DOM UI、Auto遷移をまとめない。
- Reference ModeとOriginal Modeを別エンジンにしない。分類はメタデータ、ID、Presetで表現する。
- Autoを単純な順番再生に変えない。
- Visual referenceフォルダー内の素材を無断でWeb配信対象にしない。
- ユーザーが明示していない限り、三号機的な制作ツール機能を追加しない。

## 並列開発時のGitルール

- 作業前に必ず `git status --short --branch` を確認する。
- `main` に直接コミットしない。担当範囲ごとに短い作業ブランチを切る。
- 1ブランチは1担当領域、1Phase、1目的に絞る。
- ブランチ名には担当領域を入れる。例: `feat/pattern-deep-universe`、`feat/firefly-density`、`docs/spec-phase6-5`、`integration/random-auto`。
- 他担当の未コミット変更があるファイルを編集しない。必要なら先に担当者へ確認する。
- 自分の変更だけをstageする。`git add .` は、対象が完全に確認できている場合以外は使わない。
- `main` へ入れる前に `npm run build` とブラウザ表示確認を行う。
- `main` へのmerge後はGitHub Pagesへ自動配信されるため、壊れた状態をpushしない。

## 実装前に必ず読む資料

1. `docs/00_final_design_decisions.md`
2. `docs/01_requirements_definition.md`
3. `docs/03_architecture.md`
4. `docs/08_implementation_plan.md`

## 迷ったときの判断基準

構造で迷ったら、次の順で優先する。

1. 責務分離が保たれているか。
2. Pattern、Color、Move、Preset、Effectが混ざっていないか。
3. Pattern、Color、Move、Composition、FireflySystemが混ざっていないか。
4. 黒円のブラックホール表現が共通システムに残っているか。
5. 変更がPhaseの範囲を超えていないか。
6. 実装後に見た目の調整余地が残るか。

見た目で迷ったら、まず `visual-references/` を確認し、観察メモを `visual-references/*/notes/` または `docs/11_open_questions_and_tuning_log.md` に残す。

## 推奨する進め方

1回の作業で複数Phaseをまとめて実装しない。Phaseごとに小さく実装し、`npm run build` が通る状態を維持する。

各Phase完了時には、以下を確認する。

- TypeScript buildが通る。
- 画面が表示される。
- `main.ts` が薄い入口のままになっている。
- 新しい責務が適切なフォルダーに置かれている。
- 変更理由がREADMEまたはdocsに残っている。
