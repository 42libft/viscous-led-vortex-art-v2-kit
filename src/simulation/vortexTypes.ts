export type Vec2 = { x: number; y: number };

export const VORTEX_COUNT = 3 as const;

export type VortexSwapState = {
  pairId: number;
  center: Vec2;
  orbit: Vec2;
  startAngle: number;
  direction: number;
  elapsed: number;
  duration: number;
};

export type Vortex = {
  id: number;
  position: Vec2;
  velocity: Vec2;
  radius: number;
  spin: number;
  /**
   * Debug-facing scalar (e.g. max pair pressure involving this vortex).
   * Not strictly required for the physics.
   */
  pressure: number;
  swap?: VortexSwapState;
};

export type VortexSystemParams = {
  speed: number;
  storedPressure: number;
  burst: number;
  reflectDamping: number;
  minSpeed: number;
  maxSpeed: number;
};

export type VortexUniformPayload = {
  pos: Float32Array; // vec2[3]
  vel: Float32Array; // vec2[3]
  radius: Float32Array; // float[3]
  spin: Float32Array; // float[3]
};

export function vec2(x: number, y: number): Vec2 {
  return { x, y };
}

