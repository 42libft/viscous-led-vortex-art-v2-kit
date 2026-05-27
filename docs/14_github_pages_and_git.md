# 14. GitHub / Pages対応メモ

2026-05-28時点で、Phase 10の一部としてGit管理、GitHub Actions、GitHub Pages、スマホ表示確認の土台を追加した。

## 1. 目的

- 並列開発のためにGitブランチとPRを使える状態にする。
- `main` に入ったものをGitHub Pagesへ自動デプロイする。
- スマホのブラウザでも作品鑑賞と簡易GUI操作が破綻しないようにする。
- `visual-references/` の写真・動画をPages配信対象にしない。

## 2. 追加した構成

```text
.github/
├── PULL_REQUEST_TEMPLATE.md
└── workflows/
    ├── ci.yml
    └── pages.yml
public/
└── .nojekyll
vite.config.ts
.gitattributes
.node-version
```

## 3. Workflow方針

`ci.yml`:

- PRとmain以外のpushで `npm ci` と `npm run build` を実行する。
- 並列作業ブランチの破損を早めに見つけるための確認用。

`pages.yml`:

- `main` へのpush、または手動実行で動く。
- Viteで `dist/` を生成し、Pages artifactとしてアップロードする。
- Deploy jobは `github-pages` environmentへ配信する。

## 4. Vite公開パス

`vite.config.ts` の `base` は `./` にした。

理由:

- GitHub Project Pagesの `https://<USER>.github.io/<REPO>/` 配下でも相対assetとして読み込める。
- ローカルの `npm run preview` でも同じ出力を確認しやすい。
- リポジトリ名を変えても `/<REPO>/` を書き換えなくてよい。

## 5. 参照素材の扱い

`visual-references/` は観察用であり、実行時assetではない。

そのため `.gitignore` で以下を除外する。

- `visual-references/**/photos/`
- `visual-references/**/videos/`
- `visual-references/**/frames/`
- 写真・動画系拡張子

READMEや観察メモはGit管理できるが、素材そのものは明示判断なしにGitHubへ載せない。

## 6. スマホ表示

CSS側で以下を追加した。

- `100dvw` / `100dvh` ベースの固定canvas。
- safe areaを考慮したGUI配置。
- coarse pointer / narrow viewportではGUIを下部に寄せる。

UI側ではスマホ相当のviewportやタッチデバイスでlil-guiを初期状態で閉じる。作品本体を先に見せ、必要なときだけ設定を開くため。

## 7. 初回公開手順

```sh
git init -b main
git add .
git commit -m "chore: prepare github pages deployment"
gh repo create 42libft/viscous-led-vortex-art-v2-kit --public --source=. --remote=origin --push
gh api --method POST repos/42libft/viscous-led-vortex-art-v2-kit/pages -f build_type=workflow
```

すでにリポジトリがある場合は、`origin` を既存URLに向けて `git push -u origin main` する。

## 8. 今回触っていないもの

- Pattern shader本体。
- Color / Move / Composition / FireflySystem / Effectの責務境界。
- Autoの挙動。
- 録画、投稿、タイムライン編集、外部入力など三号機的な制作ツール機能。
