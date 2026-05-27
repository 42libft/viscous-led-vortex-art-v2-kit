import { resolveColor, type ResolvedColorUniforms } from '../colors/colorResolver';
import { resolveComposition, type ResolvedCompositionUniforms } from '../composition/compositionResolver';
import { resolveFireflies, type ResolvedFireflyUniforms } from '../fireflies/fireflyResolver';
import { resolveMove, type ResolvedMoveUniforms } from '../motion/moveResolver';
import type { PatternMode, PatternPreset, Vec3, Vec4 } from '../patterns/patternTypes';

export type ResolvedPattern = {
  mode: PatternMode;
  preset: PatternPreset;
  uniforms: ResolvedPatternUniforms;
};

export type ResolvedPatternUniforms =
  ResolvedColorUniforms &
  ResolvedMoveUniforms &
  ResolvedCompositionUniforms &
  ResolvedFireflyUniforms & {
  seed: number;
  materialParams0: Vec4;
  domainParams0: Vec4;
  effectParams0: Vec4;
  blackHoleParams0: Vec4;
  blackHoleParams1: Vec4;
  rimColorBias: Vec3;
};

export function resolvePattern(mode: PatternMode, preset: PatternPreset): ResolvedPattern {
  return {
    mode,
    preset,
    uniforms: {
      ...resolveColor(preset.color),
      ...resolveMove(preset.move),
      ...resolveComposition(preset.composition),
      ...resolveFireflies(preset.fireflies, preset.seed),
      seed: preset.seed,
      materialParams0: [
        preset.material.membrane,
        preset.material.vein,
        preset.material.brightness,
        preset.material.contrast,
      ],
      domainParams0: [
        preset.domain.scale,
        preset.domain.stretch,
        preset.domain.swirl,
        preset.domain.flowAngle,
      ],
      effectParams0: [
        preset.effects.glow,
        preset.effects.specular,
        preset.effects.grain,
        preset.effects.scanline,
      ],
      blackHoleParams0: [
        preset.blackHoleStyle.coreScale,
        preset.blackHoleStyle.gravityStrength,
        preset.blackHoleStyle.gravityFalloff,
        preset.blackHoleStyle.swirlStrength,
      ],
      blackHoleParams1: [
        preset.blackHoleStyle.photonRingStrength,
        preset.blackHoleStyle.photonRingWarp,
        preset.blackHoleStyle.photonOrbitSpeed,
        preset.blackHoleStyle.photonAngularFreq,
      ],
      rimColorBias: preset.blackHoleStyle.rimColorBias,
    },
  };
}

function mixNumber(a: number, b: number, amount: number): number {
  return a * (1 - amount) + b * amount;
}

function switchNumber(a: number, b: number, amount: number): number {
  return amount < 0.5 ? a : b;
}

function mixVec3(a: Vec3, b: Vec3, amount: number): Vec3 {
  return [
    mixNumber(a[0], b[0], amount),
    mixNumber(a[1], b[1], amount),
    mixNumber(a[2], b[2], amount),
  ];
}

function mixVec4(a: Vec4, b: Vec4, amount: number): Vec4 {
  return [
    mixNumber(a[0], b[0], amount),
    mixNumber(a[1], b[1], amount),
    mixNumber(a[2], b[2], amount),
    mixNumber(a[3], b[3], amount),
  ];
}

function mixMoveParams(a: Vec4, b: Vec4, amount: number): Vec4 {
  return [
    mixNumber(a[0], b[0], amount),
    switchNumber(a[1], b[1], amount),
    mixNumber(a[2], b[2], amount),
    mixNumber(a[3], b[3], amount),
  ];
}

function mixCompositionParams(a: Vec4, b: Vec4, amount: number): Vec4 {
  return [
    switchNumber(a[0], b[0], amount),
    mixNumber(a[1], b[1], amount),
    mixNumber(a[2], b[2], amount),
    mixNumber(a[3], b[3], amount),
  ];
}

function mixFireflyParams(a: Vec4, b: Vec4, amount: number): Vec4 {
  return [
    mixNumber(a[0], b[0], amount),
    mixNumber(a[1], b[1], amount),
    mixNumber(a[2], b[2], amount),
    switchNumber(a[3], b[3], amount),
  ];
}

export function blendResolvedPatterns(
  current: ResolvedPattern,
  target: ResolvedPattern,
  amount: number,
): ResolvedPattern {
  const t = Math.min(1, Math.max(0, amount));
  const selected = t < 0.5 ? current : target;

  return {
    mode: selected.mode,
    preset: selected.preset,
    uniforms: {
      seed: switchNumber(current.uniforms.seed, target.uniforms.seed, t),
      paletteA: mixVec3(current.uniforms.paletteA, target.uniforms.paletteA, t),
      paletteB: mixVec3(current.uniforms.paletteB, target.uniforms.paletteB, t),
      paletteC: mixVec3(current.uniforms.paletteC, target.uniforms.paletteC, t),
      materialParams0: mixVec4(
        current.uniforms.materialParams0,
        target.uniforms.materialParams0,
        t,
      ),
      domainParams0: mixVec4(
        current.uniforms.domainParams0,
        target.uniforms.domainParams0,
        t,
      ),
      moveParams0: mixMoveParams(current.uniforms.moveParams0, target.uniforms.moveParams0, t),
      compositionParams0: mixCompositionParams(
        current.uniforms.compositionParams0,
        target.uniforms.compositionParams0,
        t,
      ),
      fireflyParams0: mixFireflyParams(
        current.uniforms.fireflyParams0,
        target.uniforms.fireflyParams0,
        t,
      ),
      effectParams0: mixVec4(
        current.uniforms.effectParams0,
        target.uniforms.effectParams0,
        t,
      ),
      blackHoleParams0: mixVec4(
        current.uniforms.blackHoleParams0,
        target.uniforms.blackHoleParams0,
        t,
      ),
      blackHoleParams1: mixVec4(
        current.uniforms.blackHoleParams1,
        target.uniforms.blackHoleParams1,
        t,
      ),
      rimColorBias: mixVec3(current.uniforms.rimColorBias, target.uniforms.rimColorBias, t),
    },
  };
}
