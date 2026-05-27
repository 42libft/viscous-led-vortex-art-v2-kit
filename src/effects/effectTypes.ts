export type EffectId = 'glow' | 'specular' | 'grain' | 'scanline';

export type EffectParams = {
  glow: number;
  specular: number;
  grain: number;
  scanline: number;
};

export type EffectDefinition = {
  id: EffectId;
  label: string;
  defaultStrength: number;
};
