# 2026-05-27 Video Source Uncertain Observation

注意:

- `honke-original/videos/` 配下の2本を観察したが、ユーザー指摘により本家かVersion 1かを断定しない。
- このメモは「本家Reference確定根拠」ではなく、「出所未確定動画から得た動きの観察」として扱う。
- `liquidCellular.frag.glsl` は完成Modeではなく、出所未確定動画からの実験shaderとして扱う。

対象:

- `videos/0b3e71f36bbe4b778b022b9310fc05c5.MP4`
- `videos/ScreenRecording_05-26-2026 16-43-20_1.mp4`

観察:

- 静止画よりも、黒円周辺の「薄いリング」ではなく、厚い液体の渦・油膜の層が目立つ。
- 模様は平面的なセルではなく、黒い谷、白いハイライト、青・緑・橙・赤の絵具が粘って混ざる感じ。
- 発光粒は点として存在するが、格子ではない。規則的な黒い方眼は作品表現ではなく撮影由来として扱う。
- 黒円は芯が黒いまま、周囲の模様が広い範囲で巻き込まれている。リングは細線よりも濁った周回帯。

実装上の扱い:

- `ref-magenta-green-cell` の完成根拠にはしない。
- `orig-black-oil-cell` で一時的に `liquid-cellular` を使うが、完成Mode扱いにはしない。
- 本家/Version 1の出所が分かったら、ReferenceかOriginalへ再分類する。
