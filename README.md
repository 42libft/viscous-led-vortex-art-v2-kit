# viscous-led-vortex-art v2 planning kit

これは、`42libft/viscous-led-vortex-art` の二号機をゼロから整理して作るための資料集です。

このフォルダーは、そのまま `CodeX/` 配下や、二号機プロジェクト用フォルダー内に追加して使うことを想定しています。実装コード本体ではなく、仕様書、要件定義、設計方針、実装工程、エージェント用指示、ビジュアル参照置き場をまとめたものです。

## 実装ステータス

- 2026-05-27: Phase 6.5（Visual System再設計）まで実装済み。
- 現時点では「中央短冊 + 3つの黒円 + Photon Ring + Gravity Lens + Mode/Preset選択GUI + Reference Mode候補2種 + Original WIP 1種 + Color/Move/Composition/FireflySystem/Effect分離」までで、Autoは未実装。
- 並列開発の担当境界は `docs/13_parallel_development_handoff.md` に整理済み。

## 開発

```sh
npm install
npm run dev
```

スマホなど同じLAN上の端末から確認する場合:

```sh
npm run dev:host
```

```sh
npm run build
npm run preview
```

ビルド結果を同じLAN上の端末から確認する場合:

```sh
npm run preview:host
```

## GitHub / Pages

このフォルダーはGit管理とGitHub Pages配信に対応しています。

- `main` へのpushで `.github/workflows/pages.yml` が `dist/` をGitHub Pagesへデプロイする。
- PRや作業ブランチのpushでは `.github/workflows/ci.yml` が `npm run build` を実行する。
- Viteの `base` は `./` にしているため、`https://<USER>.github.io/<REPO>/` 形式のProject Pagesでもassetパスが崩れない。
- `visual-references/` 内の写真・動画は `.gitignore` で除外し、Pages配信対象にしない。
- 並列開発では作業ブランチを分け、担当範囲は `docs/13_parallel_development_handoff.md` に従う。
- Gitの具体的な並列運用ルールは `docs/13_parallel_development_handoff.md` と `docs/14_github_pages_and_git.md` を参照する。

初回公開の流れ:

```sh
git init -b main
git add .
git commit -m "chore: prepare github pages deployment"
gh repo create 42libft/viscous-led-vortex-art-v2-kit --public --source=. --remote=origin --push
gh api --method POST repos/42libft/viscous-led-vortex-art-v2-kit/pages -f build_type=workflow
```

公開後のURLは `https://42libft.github.io/viscous-led-vortex-art-v2-kit/` です。リポジトリ名を変える場合でも、Pages workflowとVite設定はそのまま使えます。

## 使い方

1. このZIPを展開する。
2. `viscous-led-vortex-art-v2-kit/` を `CodeX/` 内のプロジェクト管理場所に置く。
3. 実装エージェントには、まず `AGENTS.md` と `docs/00_final_design_decisions.md` を読ませる。
4. 本家や自作一号機の写真・動画は、`visual-references/` 配下に入れる。
5. 実装は `docs/08_implementation_plan.md` のPhase順に進める。

## この資料集の前提

二号機は制作ツールではなく、整理された作品レンダラです。C、つまり録画、投稿、タイムライン編集、外部入力、展示運用ツール化は今回のMVP対象外です。

目標は、短冊ディスプレイ、3つのブラックホール的黒円、Reference Mode群、Original Mode群、再利用可能なEffect群、ランダムAuto遷移を、きれいに分離された構造で実装することです。

## 重要な読み順

実装前に読むもの:

- `AGENTS.md`
- `docs/00_final_design_decisions.md`
- `docs/01_requirements_definition.md`
- `docs/03_architecture.md`
- `docs/08_implementation_plan.md`

見た目に迷ったら読むもの:

- `docs/02_visual_specification.md`
- `docs/05_blackhole_vortex_spec.md`
- `visual-references/README.md`

ModeやPresetを追加するときに読むもの:

- `docs/04_mode_preset_effect_model.md`
- `templates/preset_template.ts`

Autoを触るときに読むもの:

- `docs/06_random_auto_director.md`

## 注意

`visual-references/` は参照素材置き場です。MVPでは、そこに置いた写真や動画を実行時アセットとして読み込まない方針です。あくまで人間とエージェントが観察するための資料として扱います。
