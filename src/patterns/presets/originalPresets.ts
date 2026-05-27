import type { PatternPreset } from '../patternTypes';

export const originalPresets: PatternPreset[] = [
  {
    id: 'orig-black-oil-cell-01',
    modeId: 'orig-black-oil-cell',
    label: 'Black Oil Cell WIP / 01',
    origin: 'original',
    seed: 91021,
    color: {
      mainColor: 'green',
      scheme: 'sameFamilyBlack',
      palette: {
        primary: [0.025, 0.028, 0.035],
        secondary: [0.13, 0.58, 0.44],
        accent: [0.74, 0.12, 0.5],
      },
    },
    move: { intensity: 'active', program: 'oilTremor', flowAngle: -0.2, speed: 1.05 },
    fireflies: { enabled: true, density: 0.35, brightness: 0.85, twinkleSpeed: 0.9 },
    material: { membrane: 0.94, vein: 0.5, brightness: 0.78, contrast: 1.45 },
    domain: { scale: 1.34, stretch: 0.12, swirl: 0.82, flowAngle: -0.2 },
    effects: { glow: 0.58, specular: 0.82, grain: 0.28, scanline: 0.32 },
    blackHoleStyle: {
      coreScale: 0.94,
      gravityStrength: 1.15,
      gravityFalloff: 4.8,
      swirlStrength: 0.92,
      photonRingStrength: 1.05,
      photonRingWarp: 1.0,
      photonOrbitSpeed: 0.92,
      photonAngularFreq: 8.0,
      rimGlow: 0.84,
      rimColorBias: [0.56, 0.82, 0.76],
    },
    autoWeight: 0.7,
    tags: ['original', 'oil', 'cellular'],
  },
];
