import {
  COLOR_SCHEMES,
  MAIN_COLORS,
  type ColorParams,
  type ColorRandomOptions,
  type ColorScheme,
  type ColorWeightMap,
  type MainColor,
  type PaletteParams,
  type Vec3,
} from './colorTypes';

export type ResolvedColorUniforms = {
  paletteA: Vec3;
  paletteB: Vec3;
  paletteC: Vec3;
};

type ColorFamilySwatch = {
  base: Vec3;
  sibling: Vec3;
  accent: Vec3;
  contrast: Vec3;
};

const BLACK: Vec3 = [0, 0, 0];
const WHITE: Vec3 = [1, 1, 1];

const colorFamilies: Record<MainColor, ColorFamilySwatch> = {
  blue: {
    base: [0.03, 0.2, 0.95],
    sibling: [0.05, 0.58, 1.0],
    accent: [0.95, 0.24, 1.0],
    contrast: [1.0, 0.72, 0.08],
  },
  red: {
    base: [0.9, 0.08, 0.05],
    sibling: [1.0, 0.25, 0.12],
    accent: [1.0, 0.55, 0.12],
    contrast: [0.04, 0.72, 0.9],
  },
  yellow: {
    base: [1.0, 0.78, 0.1],
    sibling: [1.0, 0.52, 0.12],
    accent: [0.05, 0.62, 0.82],
    contrast: [0.5, 0.16, 0.95],
  },
  green: {
    base: [0.02, 0.72, 0.42],
    sibling: [0.16, 0.92, 0.62],
    accent: [0.82, 0.12, 0.88],
    contrast: [1.0, 0.22, 0.32],
  },
  white: {
    base: [0.92, 0.92, 0.86],
    sibling: [0.7, 0.86, 0.88],
    accent: [0.08, 0.62, 0.68],
    contrast: [0.78, 0.42, 0.18],
  },
  purple: {
    base: [0.46, 0.14, 0.92],
    sibling: [0.22, 0.3, 1.0],
    accent: [1.0, 0.26, 0.55],
    contrast: [0.16, 0.84, 0.42],
  },
  pink: {
    base: [1.0, 0.18, 0.58],
    sibling: [0.92, 0.16, 0.95],
    accent: [0.08, 0.58, 1.0],
    contrast: [0.1, 0.78, 0.38],
  },
};

const mainColorSet = new Set<string>(MAIN_COLORS);
const colorSchemeSet = new Set<string>(COLOR_SCHEMES);

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 1);
}

function mixVec3(a: Vec3, b: Vec3, amount: number): Vec3 {
  const t = clamp01(amount);
  return [
    a[0] * (1 - t) + b[0] * t,
    a[1] * (1 - t) + b[1] * t,
    a[2] * (1 - t) + b[2] * t,
  ];
}

function shade(color: Vec3, amount: number): Vec3 {
  return mixVec3(color, BLACK, amount);
}

function tint(color: Vec3, amount: number): Vec3 {
  return mixVec3(color, WHITE, amount);
}

function sanitizeVec3(color: Vec3): Vec3 {
  return [clamp01(color[0]), clamp01(color[1]), clamp01(color[2])];
}

function sanitizePalette(palette: PaletteParams): PaletteParams {
  return {
    primary: sanitizeVec3(palette.primary),
    secondary: sanitizeVec3(palette.secondary),
    accent: sanitizeVec3(palette.accent),
  };
}

function sample01(random: () => number): number {
  return Math.min(clamp01(random()), 0.999999);
}

function normalizeCandidates<T extends string>(
  candidates: readonly T[] | undefined,
  fallback: readonly T[],
): readonly T[] {
  if (!candidates?.length) return fallback;
  return candidates;
}

function pickWeighted<T extends string>(
  candidates: readonly T[],
  weights: ColorWeightMap<T> | undefined,
  random: () => number,
): T {
  let total = 0;
  const weighted = candidates.map((id) => {
    const weight = Math.max(0, weights?.[id] ?? 1);
    total += weight;
    return { id, weight };
  });

  if (total <= 0) return candidates[0];

  let cursor = sample01(random) * total;
  for (const candidate of weighted) {
    cursor -= candidate.weight;
    if (cursor <= 0) return candidate.id;
  }

  return weighted[weighted.length - 1].id;
}

export function isMainColor(value: string): value is MainColor {
  return mainColorSet.has(value);
}

export function isColorScheme(value: string): value is ColorScheme {
  return colorSchemeSet.has(value);
}

export function createPaletteFromColor(mainColor: MainColor, scheme: ColorScheme): PaletteParams {
  const family = colorFamilies[mainColor];

  switch (scheme) {
    case 'sameFamily':
      return sanitizePalette({
        primary: shade(mixVec3(family.base, family.sibling, 0.24), 0.36),
        secondary: family.base,
        accent: tint(family.sibling, 0.32),
      });
    case 'sameFamilyBlack':
      return sanitizePalette({
        primary: mixVec3(BLACK, family.base, 0.14),
        secondary: shade(family.base, 0.24),
        accent: tint(family.base, 0.26),
      });
    case 'accentColor':
      return sanitizePalette({
        primary: shade(family.base, 0.54),
        secondary: mixVec3(family.base, family.sibling, 0.18),
        accent: family.accent,
      });
    case 'contrast':
      return sanitizePalette({
        primary: shade(family.base, 0.68),
        secondary: mixVec3(family.base, family.sibling, 0.22),
        accent: family.contrast,
      });
  }
}

export function createColorParams(
  mainColor: MainColor,
  scheme: ColorScheme,
  palette: PaletteParams = createPaletteFromColor(mainColor, scheme),
): ColorParams {
  return {
    mainColor,
    scheme,
    palette: sanitizePalette(palette),
  };
}

export function createRandomColorParams(options: ColorRandomOptions = {}): ColorParams {
  const random = options.random ?? Math.random;
  const mainColors = normalizeCandidates(options.mainColors, MAIN_COLORS);
  const schemes = normalizeCandidates(options.schemes, COLOR_SCHEMES);
  const mainColor = pickWeighted(mainColors, options.mainColorWeights, random);
  const scheme = pickWeighted(schemes, options.schemeWeights, random);
  return createColorParams(mainColor, scheme);
}

export function resolveColor(color: ColorParams): ResolvedColorUniforms {
  const palette = sanitizePalette(color.palette);

  return {
    paletteA: palette.primary,
    paletteB: palette.secondary,
    paletteC: palette.accent,
  };
}
