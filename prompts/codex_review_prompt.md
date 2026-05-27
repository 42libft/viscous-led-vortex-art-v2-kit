# Codex Review Prompt

今回の変更をレビューしてください。

重点確認項目:

- `src/main.ts` が薄い入口のままか。
- renderer / simulation / patterns / effects / settings / ui が混ざっていないか。
- 黒円がMode内に埋め込まれていないか。
- Autoが固定順序になっていないか。
- ReferenceとOriginalが別エンジンになっていないか。
- shaderが巨大な1ファイルに戻っていないか。
- visual-references内の素材をpublic配信対象にしていないか。
- 対象Phaseを超えた機能追加をしていないか。
- `npm run build` が通るか。

問題があれば、修正案をPhase内の範囲に限定して提案してください。
