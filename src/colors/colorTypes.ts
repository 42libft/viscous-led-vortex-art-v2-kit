export const MAIN_COLORS = ['blue', 'red', 'yellow', 'green', 'white', 'purple', 'pink'] as const;

export type MainColor = (typeof MAIN_COLORS)[number];

export const COLOR_SCHEMES = [
  'sameFamily',
  'sameFamilyBlack',
  'accentColor',
  'contrast',
] as const;

export type ColorScheme = (typeof COLOR_SCHEMES)[number];

export type Vec3 = readonly [number, number, number];

export type PaletteParams = {
  primary: Vec3;
  secondary: Vec3;
  accent: Vec3;
};

export type ColorParams = {
  mainColor: MainColor;
  scheme: ColorScheme;
  palette: PaletteParams;
};

export type ColorWeightMap<T extends string> = Partial<Record<T, number>>;

export type ColorRandomOptions = {
  mainColors?: readonly MainColor[];
  schemes?: readonly ColorScheme[];
  mainColorWeights?: ColorWeightMap<MainColor>;
  schemeWeights?: ColorWeightMap<ColorScheme>;
  random?: () => number;
};
