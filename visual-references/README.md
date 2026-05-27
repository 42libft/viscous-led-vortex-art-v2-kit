# visual-references

ここは、ビジュアル参照用の写真・動画・抽出フレームを置くフォルダーです。

MVPでは、このフォルダー内の素材を実行時アセットとして読み込みません。人間とエージェントが見た目の判断をするための資料置き場です。

## フォルダー構成

```text
visual-references/
├── honke-original/
│   ├── photos/     # 本家作品の写真
│   ├── videos/     # 本家作品の動画
│   ├── frames/     # 動画から切り出したフレーム
│   └── notes/      # 観察メモ
└── self-v1/
    ├── photos/     # 自作一号機の写真・スクショ
    ├── videos/     # 自作一号機の動画
    ├── frames/     # 動画から切り出したフレーム
    └── notes/      # 観察メモ
```

## 推奨ファイル名

```text
honke_pale_mineral_01.jpg
honke_deep_blue_universe_01.mov
honke_magenta_green_cell_frame_001.jpg
self_v1_black_oil_cell_01.png
self_v1_deep_blue_test_2026-05-27.mov
```

## エージェントへの使わせ方

見た目の再現・調整で迷ったときは、エージェントに次のように依頼してください。

```text
visual-references/honke-original/photos と frames を確認して、
現在のref-deep-blue-universeとの差分を観察してください。
コード変更の前に、黒円、リング、模様密度、色、LED感、発光粒、重力レンズ感の観点でメモしてください。
```

## 注意

- ここに置いた素材を勝手に `public/` に移さない。
- ここに置いた素材をそのままshader textureとして使わない。
- 参照素材は、構図、色、密度、質感、動きの推測に使う。
- 実装は、観察した視覚言語を抽象化して作る。
