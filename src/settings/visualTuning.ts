import type { ColorScheme, MainColor } from '../colors/colorTypes';
import { createPaletteFromColor } from '../colors/colorResolver';
import type { CompositionMode } from '../composition/compositionTypes';
import type { MoveIntensity, MoveProgram } from '../motion/moveTypes';
import type { PatternPreset } from '../patterns/patternTypes';

export type VisualTuningState = {
  mainColor: MainColor;
  colorScheme: ColorScheme;
  compositionMode: CompositionMode;
  compositionSeed: number;
  moveIntensity: MoveIntensity;
  moveProgram: MoveProgram;
  fireflyDensity: number;
  glow: number;
  specular: number;
  grain: number;
  scanline: number;
};

export function createVisualTuningFromPreset(preset: PatternPreset): VisualTuningState {
  return {
    mainColor: preset.color.mainColor,
    colorScheme: preset.color.scheme,
    compositionMode: preset.composition?.mode ?? 'full',
    compositionSeed: preset.composition?.seed ?? preset.seed,
    moveIntensity: preset.move.intensity,
    moveProgram: preset.move.program,
    fireflyDensity: preset.fireflies.density,
    glow: preset.effects.glow,
    specular: preset.effects.specular,
    grain: preset.effects.grain,
    scanline: preset.effects.scanline,
  };
}

export function applyVisualTuning(preset: PatternPreset, tuning: VisualTuningState): PatternPreset {
  const keepPresetPalette =
    tuning.mainColor === preset.color.mainColor &&
    tuning.colorScheme === preset.color.scheme;

  return {
    ...preset,
    color: {
      mainColor: tuning.mainColor,
      scheme: tuning.colorScheme,
      palette: keepPresetPalette
        ? preset.color.palette
        : createPaletteFromColor(tuning.mainColor, tuning.colorScheme),
    },
    move: {
      ...preset.move,
      intensity: tuning.moveIntensity,
      program: tuning.moveProgram,
    },
    composition: {
      mode: tuning.compositionMode,
      seed: tuning.compositionSeed,
    },
    fireflies: {
      ...preset.fireflies,
      density: tuning.fireflyDensity,
    },
    effects: {
      ...preset.effects,
      glow: tuning.glow,
      specular: tuning.specular,
      grain: tuning.grain,
      scanline: tuning.scanline,
    },
  };
}
