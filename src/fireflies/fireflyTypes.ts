export type FireflyParams = {
  enabled: boolean;
  density: number;
  brightness: number;
  twinkleSpeed: number;
};

export const DEFAULT_FIREFLY_PARAMS: FireflyParams = {
  enabled: true,
  density: 0.45,
  brightness: 0.75,
  twinkleSpeed: 0.8,
};

export const FIREFLY_PARAM_LIMITS = {
  density: { min: 0, max: 2 },
  brightness: { min: 0, max: 2 },
  twinkleSpeed: { min: 0, max: 3 },
} as const;

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function normalizeFireflyParams(params: FireflyParams): FireflyParams {
  return {
    enabled: params.enabled,
    density: clamp(params.density, FIREFLY_PARAM_LIMITS.density.min, FIREFLY_PARAM_LIMITS.density.max),
    brightness: clamp(
      params.brightness,
      FIREFLY_PARAM_LIMITS.brightness.min,
      FIREFLY_PARAM_LIMITS.brightness.max,
    ),
    twinkleSpeed: clamp(
      params.twinkleSpeed,
      FIREFLY_PARAM_LIMITS.twinkleSpeed.min,
      FIREFLY_PARAM_LIMITS.twinkleSpeed.max,
    ),
  };
}
