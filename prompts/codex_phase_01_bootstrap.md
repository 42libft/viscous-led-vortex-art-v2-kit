# Codex Prompt: Phase 1 Bootstrap

このプロジェクトは viscous-led-vortex-art の二号機です。

まず以下を読んでください。

- AGENTS.md
- docs/00_final_design_decisions.md
- docs/01_requirements_definition.md
- docs/03_architecture.md
- docs/08_implementation_plan.md

今回はPhase 1だけ実装してください。

目的:

- Vite + TypeScript + WebGL2の骨格を作る。
- `src/main.ts` を薄い入口にする。
- `app/createApp.ts` と `renderer/WebGLRenderer.ts` を作る。
- fullscreen triangleで固定色を描く。
- shader compile errorを画面に表示する。

まだ作らないもの:

- 短冊パネル。
- 黒円。
- Pattern Mode。
- RandomAutoDirector。
- Effect System。

完了後、変更ファイル、設計理由、次Phaseへの注意点を報告してください。
