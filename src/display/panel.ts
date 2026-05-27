export type PanelSettings = {
  /**
   * Panel aspect ratio as height / width.
   * Larger values mean a thinner (more vertical) strip.
   */
  aspect: number;
  /**
   * 0..1 fit factor against the maximum panel that fits the viewport.
   */
  scale: number;
};

export const DEFAULT_PANEL_SETTINGS: PanelSettings = {
  // v1の「縦長パネル目標アスペクト比 0.265（= 幅 / 高さ）」相当。
  // ここでは height / width を採用しているため逆数にする。
  aspect: 1 / 0.265,
  scale: 0.94,
};
