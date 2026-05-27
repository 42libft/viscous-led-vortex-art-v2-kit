import type { PatternPreset } from '../src/patterns/patternTypes';

export const presetTemplate: PatternPreset = {
  id: 'orig-example-01',
  modeId: 'orig-example-mode',
  label: 'Original / Example 01',
  origin: 'original',
  seed: 12345,
  palette: {
    // 実装側のPaletteParamsに合わせて埋める
  },
  material: {
    // membrane, oil, mineral, universe, veinなどの強度
  },
  domain: {
    // warp, scale, stretch, swirlなど
  },
  effects: {
    // ledGrid, fireflies, glow, scanline, specularなど
  },
  blackHoleStyle: {
    // coreScale, gravityStrength, photonRingStrengthなど
  },
  autoWeight: 1,
  tags: ['original', 'example'],
};
