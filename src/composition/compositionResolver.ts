import type { Vec4 } from '../patterns/patternTypes';
import type { CompositionMode, CompositionParams } from './compositionTypes';

const DEFAULT_COMPOSITION: CompositionParams = {
  mode: 'full',
  seed: 0,
};

const modeCodeById: Record<CompositionMode, number> = {
  none: 0,
  full: 1,
  randomSpot: 2,
  bottomBloom: 3,
  edgeOverflow: 4,
  depthLayers: 5,
};

function seededUnit(seed: number, salt: number): number {
  const value = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function safeComposition(composition: CompositionParams): CompositionParams {
  return {
    mode: composition.mode,
    seed: Number.isFinite(composition.seed) ? composition.seed : DEFAULT_COMPOSITION.seed,
  };
}

export type ResolvedCompositionUniforms = {
  compositionParams0: Vec4;
};

export function resolveComposition(composition: CompositionParams = DEFAULT_COMPOSITION): ResolvedCompositionUniforms {
  const resolved = safeComposition(composition);
  const spotX = 0.16 + seededUnit(resolved.seed, 1) * 0.68;
  const spotY = 0.14 + seededUnit(resolved.seed, 2) * 0.72;
  const spotRadius = 0.16 + seededUnit(resolved.seed, 3) * 0.28;

  return {
    compositionParams0: [
      modeCodeById[resolved.mode],
      spotX,
      spotY,
      spotRadius,
    ],
  };
}
