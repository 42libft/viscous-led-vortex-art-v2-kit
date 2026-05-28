import type { PatternMode } from './patternTypes';

export const referenceModes: PatternMode[] = [
  {
    id: 'ref-deep-blue-universe',
    label: 'Reference / Deep Blue Universe',
    origin: 'reference',
    family: 'universe',
    shaderVariant: 'deep-universe',
    defaultPresetId: 'ref-deep-blue-universe-01',
    allowedEffects: ['glow', 'specular', 'grain', 'scanline'],
  },
  {
    id: 'ref-pale-mineral',
    label: 'Reference / Pale Mineral',
    origin: 'reference',
    family: 'mineral',
    shaderVariant: 'mineral-fluid',
    defaultPresetId: 'ref-pale-mineral-01',
    allowedEffects: ['glow', 'specular', 'grain', 'scanline'],
  },
  {
    id: 'ref-magenta-green-cell',
    label: 'Reference / Magenta Green Cell',
    origin: 'reference',
    family: 'cellular',
    shaderVariant: 'black-hole-debug',
    defaultPresetId: 'ref-magenta-green-cell-01',
    allowedEffects: ['glow', 'specular', 'grain', 'scanline'],
  },
  {
    id: 'ref-blue-purple-vein',
    label: 'Reference / Blue Purple Vein',
    origin: 'reference',
    family: 'vein',
    shaderVariant: 'vein-botanical',
    defaultPresetId: 'ref-blue-purple-vein-01',
    allowedEffects: ['glow', 'specular', 'grain', 'scanline'],
  },
];
