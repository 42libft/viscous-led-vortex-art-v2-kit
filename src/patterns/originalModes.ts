import type { PatternMode } from './patternTypes';

export const originalModes: PatternMode[] = [
  {
    id: 'orig-black-oil-cell',
    label: 'Original / Black Oil Cell WIP',
    origin: 'original',
    family: 'oil',
    shaderVariant: 'liquid-cellular',
    defaultPresetId: 'orig-black-oil-cell-01',
    allowedEffects: ['glow', 'specular', 'grain', 'scanline'],
  },
];
