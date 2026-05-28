# Liquid Universe Next Handoff

これは、`viscous-led-vortex-art-v2-kit` から次作Liquid Universeへ渡すためのスターターパッケージです。

このパッケージは「蒼氓蟲譜を再現するための続き」ではありません。流用対象は、WebGL2基盤、BlackHole / VortexSystem、FireflySystem、Effect System、RandomAutoDirector、責務分離の考え方です。旧Reference Modeの見た目は、次作の正解ではなく、実装例としてだけ扱います。

## 使い方

1. 新しいプロジェクト用ディレクトリを作る。
2. このパッケージの中身を展開する。
3. `package.json` の `name` を次作名へ変える。
4. `src/display/panel.ts` と `src/shaders/common/panel.glsl` を `LiquidFrameSystem` 相当へ改名・拡張する。
5. `src/patterns/` の `reference` / `original` 分類を、次作の `lineage` や `ecosystem` へ置き換える。
6. 旧 `ref-*` PresetをAuto候補から外し、独自Patternを作る。
7. `npm install`、`npm run build` で移植の破綻がないか確認する。

## まず読むもの

- `handoff/docs/concept-brief.md`
- `handoff/docs/reuse-map.md`
- `handoff/AGENTS.md`
- `docs/15_project_closure_and_reuse_handoff.md`

## 含めていないもの

- `visual-references/` 内の写真・動画。
- `dist/`。
- `node_modules/`。
- `test-results/`。
- 本家素材を実行時assetとして使う仕組み。

## 最初の実装目標

最初の画面は、短冊の再現ではなく、黒い展示空間の中に「変化する枠」が出る状態にする。枠の中では独自Patternが動き、黒円は共通VortexSystemとして存在する。模様の正しさより、境界が液体化している感覚を優先する。
