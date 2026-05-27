# 09. Acceptance Checklist

MVP完成判定用チェックリストです。

## 1. 構造

- [ ] `src/main.ts` が薄い入口になっている。
- [ ] rendererがWebGL初期化とdrawを担当している。
- [ ] simulationが黒円物理を担当している。
- [ ] patternsがMode / Presetを担当している。
- [ ] effectsが共通Effectを担当している。
- [ ] settingsが設定値とAutoを担当している。
- [ ] uiがGUIとボタンを担当している。
- [ ] shaderがcommon / variantsに分かれている。

## 2. 短冊パネル

- [ ] 画面中央に縦長パネルが表示される。
- [ ] パネル外は黒い展示空間として見える。
- [ ] resizeしてもパネルが破綻しない。
- [ ] panelUvが全Modeで共通利用されている。

## 3. 黒円 / ブラックホール

- [ ] 3つの黒円が常時存在する。
- [ ] 黒円がパネル内を漂う。
- [ ] 壁反射または押し戻しがある。
- [ ] 接近時に押し合う。
- [ ] 圧力解放でswapする。
- [ ] Event Horizonが完全な黒として見える。
- [ ] Photon Ringが外周に見える。
- [ ] Photon Ring周辺で模様が高速周回して見える。
- [ ] Gravity Lensで周囲模様が屈折する。

## 4. Pattern Mode

- [ ] Reference Modeが最低2つある。
- [ ] Original Modeが最低1つある。
- [ ] Modeにorigin metadataがある。
- [ ] ModeとPresetが分かれている。
- [ ] Preset切替で見た目が変わる。
- [ ] Modeごとに黒円物理をコピーしていない。

## 5. Effect

- [ ] FireflySystemがEffectから分離されている。
- [ ] 白い発光点が複数Modeで共通利用されている。
- [ ] glowがある。
- [ ] specularまたはgrainがある。
- [ ] EffectをGUIで調整できる。
- [ ] EffectがModeに過剰依存していない。
- [ ] `ledGrid` が撮影由来の黒い方眼として誤用されていない。

## 5.5 Color / Move / Composition

- [ ] ColorがPatternから分離されている。
- [ ] `mainColor` と `colorScheme` がある。
- [ ] Move intensityがある。
- [ ] Move programがある。
- [ ] Vortex巻き込みとMoveが混ざっていない。
- [ ] Compositionが任意カテゴリとして扱われている。
- [ ] `randomSpot` または `bottomBloom` の実装余地がある。

## 6. Random Auto

- [ ] Autoが固定順序ではない。
- [ ] 次Presetが重み付きランダムで選ばれる。
- [ ] 同じPresetが連続しない。
- [ ] hold / transitionがある。
- [ ] 補間可能な値が滑らかに変わる。
- [ ] AutoをOFFにして手動選択できる。

## 7. UI

- [ ] lil-guiで主要値を調整できる。
- [ ] Settings表示切替がある。
- [ ] Immersive / Fullscreenがある。
- [ ] 小画面でGUIが邪魔になりすぎない。

## 8. ビジュアル

- [ ] 暗闇に短冊発光体が浮かぶ印象がある。
- [ ] 深青宇宙系の見た目が出る。
- [ ] 白地鉱物・膜系の見た目が出る。
- [ ] 細胞膜または油膜系の見た目が出る。
- [ ] LED面の物体感がある。
- [ ] 白い点々が蛍/星/反射として見える。
- [ ] 黒円が単なる黒丸ではなくブラックホールに見える。

## 9. ビルド・配信

- [ ] `npm install` 後に起動できる。
- [ ] `npm run dev` が動く。
- [ ] `npm run build` が通る。
- [ ] `npm run preview` が動く。
- [ ] GitHub Pagesでのbase pathを考慮している。

## 10. ドキュメント

- [ ] READMEがある。
- [ ] Mode追加手順が書かれている。
- [ ] Preset追加手順が書かれている。
- [ ] visual referencesの置き場所が説明されている。
- [ ] 調整ログが残っている。
