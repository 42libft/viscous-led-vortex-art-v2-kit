import type { EffectId, EffectParams } from '../effects/effectTypes';
import type { ColorParams } from '../colors/colorTypes';
import type { CompositionParams } from '../composition/compositionTypes';
import type { FireflyParams } from '../fireflies/fireflyTypes';
import type { MoveParams } from '../motion/moveTypes';

export type PatternOrigin = 'reference' | 'original';

export type PatternFamily =
  | 'mineral'
  | 'universe'
  | 'cellular'
  | 'vein'
  | 'botanical'
  | 'oil'
  | 'cloud'
  | 'hybrid';

export type ShaderVariant =
  | 'black-hole-debug'
  | 'mineral-fluid'
  | 'deep-universe'
  | 'liquid-cellular'
  | 'vein-botanical'
  | 'oil-membrane';

export type Vec3 = readonly [number, number, number];
export type Vec4 = readonly [number, number, number, number];

export type MaterialParams = {
  membrane: number;
  vein: number;
  brightness: number;
  contrast: number;
};

export type DomainParams = {
  scale: number;
  stretch: number;
  swirl: number;
  flowAngle: number;
};

export type BlackHoleStyleParams = {
  coreScale: number;
  gravityStrength: number;
  gravityFalloff: number;
  swirlStrength: number;
  photonRingStrength: number;
  photonRingWarp: number;
  photonOrbitSpeed: number;
  photonAngularFreq: number;
  rimGlow: number;
  rimColorBias: Vec3;
};

export type PatternMode = {
  id: string;
  label: string;
  origin: PatternOrigin;
  family: PatternFamily;
  shaderVariant: ShaderVariant;
  defaultPresetId: string;
  allowedEffects: EffectId[];
};

export type PatternPreset = {
  id: string;
  modeId: string;
  label: string;
  origin: PatternOrigin;
  seed: number;
  color: ColorParams;
  move: MoveParams;
  composition?: CompositionParams;
  fireflies: FireflyParams;
  material: MaterialParams;
  domain: DomainParams;
  effects: EffectParams;
  blackHoleStyle: BlackHoleStyleParams;
  autoWeight?: number;
  tags?: string[];
};
