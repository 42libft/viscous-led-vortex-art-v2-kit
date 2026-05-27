import type { Vec4 } from '../patterns/patternTypes';
import { moveIntensityDefinitions, moveProgramDefinitions } from './moveTypes';
import type { MoveParams } from './moveTypes';

const twoPi = Math.PI * 2;
const minSpeed = 0;
const maxSpeed = 2.5;

export type ResolvedMoveUniforms = {
  moveParams0: Vec4;
};

function clampFinite(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function normalizeAngleRadians(angle: number): number {
  if (!Number.isFinite(angle)) return 0;
  return ((angle % twoPi) + twoPi) % twoPi;
}

export function resolveMove(move: MoveParams): ResolvedMoveUniforms {
  const intensity = moveIntensityDefinitions[move.intensity];
  const program = moveProgramDefinitions[move.program];

  return {
    moveParams0: [
      intensity.scale,
      program.code,
      normalizeAngleRadians(move.flowAngle),
      clampFinite(move.speed, minSpeed, maxSpeed, 1),
    ],
  };
}
