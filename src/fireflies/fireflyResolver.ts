import type { Vec4 } from '../patterns/patternTypes';
import { normalizeFireflyParams, type FireflyParams } from './fireflyTypes';

export type ResolvedFireflyUniforms = {
  fireflyParams0: Vec4;
};

export function resolveFireflies(fireflies: FireflyParams, seed: number): ResolvedFireflyUniforms {
  const normalized = normalizeFireflyParams(fireflies);
  const density = normalized.enabled ? normalized.density : 0;

  return {
    fireflyParams0: [
      density,
      density > 0 ? normalized.brightness : 0,
      normalized.twinkleSpeed,
      Number.isFinite(seed) ? seed : 0,
    ],
  };
}
