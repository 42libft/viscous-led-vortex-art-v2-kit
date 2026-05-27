# MANIFEST

この資料集の中身です。

## ルート

- `README.md`: 使い方と全体説明。
- `AGENTS.md`: Codex等の実装エージェントに最初に読ませる指示。
- `MANIFEST.md`: この一覧。

## docs

- `00_final_design_decisions.md`: 壁打ちで確定した上位方針。
- `01_requirements_definition.md`: 要件定義。
- `02_visual_specification.md`: 視覚仕様。
- `03_architecture.md`: プログラム全体構造。
- `04_mode_preset_effect_model.md`: Mode / Preset / Effectの設計。
- `05_blackhole_vortex_spec.md`: 黒円・ブラックホール・渦物理の仕様。
- `06_random_auto_director.md`: ランダムAuto遷移の仕様。
- `07_shader_design.md`: shader分割とuniform設計。
- `08_implementation_plan.md`: 作業工程。
- `09_acceptance_checklist.md`: 完成判定チェックリスト。
- `10_agent_workflow_and_prompts.md`: エージェント運用と投入プロンプト。
- `11_open_questions_and_tuning_log.md`: 未決事項・調整ログ。

## references

- `v1-current-spec/SPEC.md`: 現行一号機仕様の参照コピー。
- `v1-current-spec/v2_requirements_draft_initial.md`: 初期叩き台の参照コピー。

## visual-references

写真・動画・抽出フレームを置くフォルダーです。現時点では空フォルダーとREADMEだけを入れています。

## templates

- `preset_template.ts`: Preset追加用のTypeScript雛形。
- `visual_observation_template.md`: 参照画像観察メモ用テンプレート。
- `tuning_log_template.md`: 調整ログ用テンプレート。

## prompts

- `codex_phase_01_bootstrap.md`: Phase 1開始用プロンプト。
- `codex_phase_02_vortex.md`: BlackHole / Vortex実装開始用プロンプト。
- `codex_review_prompt.md`: 実装レビュー用プロンプト。
