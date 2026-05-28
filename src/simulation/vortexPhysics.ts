import { type Vec2, type Vortex, type VortexSystemParams, vec2, VORTEX_COUNT } from './vortexTypes';

const PAIR_COUNT = 3 as const;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function length(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

function smooth01(t: number): number {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

function rotate(v: Vec2, radians: number): Vec2 {
  const s = Math.sin(radians);
  const c = Math.cos(radians);
  return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
}

function boundsFor(vortex: Vortex): { minX: number; maxX: number; minY: number; maxY: number } {
  const marginX = Math.max(vortex.radius * 3.2, 0.2);
  const marginY = Math.max(vortex.radius * 2.0, 0.075);
  return {
    minX: marginX,
    maxX: 1 - marginX,
    minY: marginY,
    maxY: 1 - marginY,
  };
}

function reflectIntoBounds(vortex: Vortex, damping: number): void {
  const b = boundsFor(vortex);
  if (vortex.position.x < b.minX) {
    vortex.position.x = b.minX;
    vortex.velocity.x *= -damping;
  } else if (vortex.position.x > b.maxX) {
    vortex.position.x = b.maxX;
    vortex.velocity.x *= -damping;
  }
  if (vortex.position.y < b.minY) {
    vortex.position.y = b.minY;
    vortex.velocity.y *= -damping;
  } else if (vortex.position.y > b.maxY) {
    vortex.position.y = b.maxY;
    vortex.velocity.y *= -damping;
  }
}

function wallPressure01(vortex: Vortex): number {
  const b = boundsFor(vortex);
  const dx = Math.min(vortex.position.x - b.minX, b.maxX - vortex.position.x);
  const dy = Math.min(vortex.position.y - b.minY, b.maxY - vortex.position.y);
  const dist = Math.min(dx, dy);
  const band = vortex.radius * 1.25 + 0.02;
  return clamp(1 - dist / band, 0, 1);
}

function pairIndex(i: number, j: number): number {
  const a = Math.min(i, j);
  const b = Math.max(i, j);
  if (a === 0 && b === 1) return 0;
  if (a === 0 && b === 2) return 1;
  return 2;
}

function cross(ax: number, ay: number, bx: number, by: number): number {
  return ax * by - ay * bx;
}

function computeSpeedDrift01(timeSeconds: number, id: number): number {
  const t = timeSeconds;
  const a = 0.5 + 0.5 * Math.sin(t * 0.47 + id * 2.1);
  const b = 0.5 + 0.5 * Math.sin(t * 0.23 + id * 3.7);
  const pulse = Math.pow(0.5 + 0.5 * Math.sin(t * 0.83 + id * 5.4), 3.0);
  return clamp(0.5 * a + 0.36 * b + 0.14 * pulse, 0, 1);
}

function computeHeadingWander(timeSeconds: number, id: number): number {
  const t = timeSeconds;
  return (
    Math.sin(t * 0.31 + id * 1.7) * 0.16 +
    Math.sin(t * 0.17 + id * 4.3) * 0.12 +
    Math.sin(t * 0.09 + id * 6.8) * 0.2
  );
}

function updateFreeMove(vortex: Vortex, step: number, timeSeconds: number, params: VortexSystemParams): void {
  const drift = computeSpeedDrift01(timeSeconds, vortex.id);
  const targetSpeed = params.minSpeed + (params.maxSpeed - params.minSpeed) * (0.24 + 0.62 * drift);

  const angle = Math.atan2(vortex.velocity.y, vortex.velocity.x);
  const wander = computeHeadingWander(timeSeconds, vortex.id);
  const nextAngle = angle + wander * step;

  const currentSpeed = length(vortex.velocity.x, vortex.velocity.y);
  const nextSpeed = currentSpeed + (targetSpeed - currentSpeed) * (1 - Math.exp(-step * 0.78));

  vortex.velocity.x = Math.cos(nextAngle) * nextSpeed;
  vortex.velocity.y = Math.sin(nextAngle) * nextSpeed;

  vortex.position.x += vortex.velocity.x * step;
  vortex.position.y += vortex.velocity.y * step;

  reflectIntoBounds(vortex, params.reflectDamping);

  const speed = length(vortex.velocity.x, vortex.velocity.y);
  if (speed > 1e-6) {
    const clamped = clamp(speed, params.minSpeed, params.maxSpeed);
    const k = clamped / speed;
    vortex.velocity.x *= k;
    vortex.velocity.y *= k;
  }
}

function updateSwapMotion(vortex: Vortex, step: number): void {
  const swap = vortex.swap;
  if (!swap) return;
  const previous = vec2(vortex.position.x, vortex.position.y);
  swap.elapsed += step;
  const t = swap.duration <= 1e-6 ? 1 : clamp(swap.elapsed / swap.duration, 0, 1);
  const ease = smooth01(t);
  const angle = swap.startAngle + swap.direction * Math.PI * ease;
  const orbitRotated = rotate(swap.orbit, angle - swap.startAngle);
  vortex.position.x = swap.center.x + orbitRotated.x;
  vortex.position.y = swap.center.y + orbitRotated.y;
  const safeStep = Math.max(step, 1e-6);
  vortex.velocity.x = (vortex.position.x - previous.x) / safeStep;
  vortex.velocity.y = (vortex.position.y - previous.y) / safeStep;
  if (t >= 1) {
    vortex.velocity.x = swap.entryVelocity.x;
    vortex.velocity.y = swap.entryVelocity.y;
    vortex.swap = undefined;
  }
}

export type VortexPairState = {
  pressures: Float32Array; // length 3
  cooldowns: Float32Array; // length 3
};

export function createDefaultVortices(): Vortex[] {
  return [
    {
      id: 0,
      position: vec2(0.6, 0.78),
      velocity: vec2(0.026, -0.018),
      radius: 0.046,
      spin: 1.0,
      pressure: 0,
    },
    {
      id: 1,
      position: vec2(0.43, 0.5),
      velocity: vec2(-0.025, 0.02),
      radius: 0.043,
      spin: -1.0,
      pressure: 0,
    },
    {
      id: 2,
      position: vec2(0.56, 0.22),
      velocity: vec2(0.022, 0.019),
      radius: 0.045,
      spin: 1.0,
      pressure: 0,
    },
  ];
}

export function createDefaultPairState(): VortexPairState {
  return {
    pressures: new Float32Array(PAIR_COUNT),
    cooldowns: new Float32Array(PAIR_COUNT),
  };
}

export function updateVortices(args: {
  vortices: Vortex[];
  pair: VortexPairState;
  dtSeconds: number;
  timeSeconds: number;
  physicsAspect: number; // width/height
  params: VortexSystemParams;
}): void {
  const { vortices, pair, params } = args;
  if (vortices.length !== VORTEX_COUNT) throw new Error('VortexSystem expects exactly 3 vortices');

  const step = Math.min(args.dtSeconds, 0.033) * params.speed;
  if (step <= 0) return;

  for (let i = 0; i < PAIR_COUNT; i++) {
    pair.cooldowns[i] = Math.max(0, pair.cooldowns[i] - step);
    pair.pressures[i] = Math.max(0, pair.pressures[i] - step * 0.38);
  }

  // Swap trajectories have priority.
  for (let i = 0; i < VORTEX_COUNT; i++) {
    updateSwapMotion(vortices[i], step);
  }

  for (let i = 0; i < VORTEX_COUNT; i++) {
    if (vortices[i].swap) continue;
    updateFreeMove(vortices[i], step, args.timeSeconds, params);
  }

  // Pair interactions (pressure + mild repulsion + swap trigger).
  for (let a = 0; a < VORTEX_COUNT; a++) {
    for (let b = a + 1; b < VORTEX_COUNT; b++) {
      const va = vortices[a];
      const vb = vortices[b];
      const idx = pairIndex(a, b);
      if (pair.cooldowns[idx] > 0) continue;
      if (va.swap || vb.swap) continue;

      const dx = vb.position.x - va.position.x;
      const dy = vb.position.y - va.position.y;
      const dist = Math.hypot(dx * args.physicsAspect, dy);
      const r = Math.max(va.radius, vb.radius);
      const squeezeDist = r * 2.28;
      const swapDist = r * 1.42;
      if (dist >= squeezeDist) continue;

      const overlap = squeezeDist - dist;
      const pressureBase = overlap / Math.max(1e-6, squeezeDist - swapDist);
      const nx = dist > 1e-6 ? (dx * args.physicsAspect) / dist : 1;
      const ny = dist > 1e-6 ? dy / dist : 0;
      const relMetricVx = (vb.velocity.x - va.velocity.x) * args.physicsAspect;
      const relMetricVy = vb.velocity.y - va.velocity.y;
      const closingSpeed = Math.max(0, -(relMetricVx * nx + relMetricVy * ny));
      const headOn = smooth01(clamp((closingSpeed - 0.012) / 0.056, 0, 1));
      const deepOverlap = smooth01(clamp((pressureBase - 0.7) / 1.25, 0, 1));

      // Mild repulsion while pressure accumulates.
      const squeeze = overlap * (
        0.022 +
        Math.min(pair.pressures[idx], 1.0) * 0.016 +
        headOn * 0.01 +
        deepOverlap * 0.012
      );
      if (dist > 1e-6) {
        // Convert back from metric-space normal to uv-space delta.
        const pushX = (nx / Math.max(1e-6, args.physicsAspect)) * squeeze;
        const pushY = ny * squeeze;
        va.position.x -= pushX;
        va.position.y -= pushY;
        vb.position.x += pushX;
        vb.position.y += pushY;
      }

      // Confinement: walls + third vortex crowding.
      const third = 3 - (a + b);
      const vt = vortices[third];
      const centerX = (va.position.x + vb.position.x) * 0.5;
      const centerY = (va.position.y + vb.position.y) * 0.5;
      const tdx = (vt.position.x - centerX) * args.physicsAspect;
      const tdy = vt.position.y - centerY;
      const crowding = clamp(1 - Math.hypot(tdx, tdy) / (r * 4.2), 0, 1);
      const confinement = Math.max(wallPressure01(va), wallPressure01(vb), crowding);

      const pressureRate = (
        0.82 +
        confinement * 3.6 +
        headOn * 2.1 +
        deepOverlap * 1.55
      ) * params.storedPressure;
      pair.pressures[idx] = Math.min(4.0, pair.pressures[idx] + pressureBase * pressureRate * step);

      if (pair.pressures[idx] > 2.15) {
        // Start swap: half-orbit around the midpoint.
        const center = vec2(centerX, centerY);
        const orbitA = vec2(va.position.x - centerX, va.position.y - centerY);
        const orbitB = vec2(vb.position.x - centerX, vb.position.y - centerY);

        // Direction from relative velocity cross product (keeps burst consistent).
        const relVx = vb.velocity.x - va.velocity.x;
        const relVy = vb.velocity.y - va.velocity.y;
        const dir = Math.sign(cross(dx, dy, relVx, relVy)) || (a === 0 ? 1 : -1);

        const releaseEase = clamp(pair.pressures[idx] / 4.0, 0, 1);
        const burstEase = clamp(params.burst / 100, 0, 1);
        const baseDuration = 0.52 * Math.pow(1 - releaseEase, 1.9) + 0.018;
        const duration = Math.max(0.018, baseDuration * (1 - burstEase * 0.65));

        va.swap = {
          pairId: idx,
          center,
          orbit: orbitA,
          startAngle: Math.atan2(orbitA.y, orbitA.x),
          direction: dir,
          elapsed: 0,
          duration,
          entryVelocity: vec2(va.velocity.x, va.velocity.y),
        };
        vb.swap = {
          pairId: idx,
          center,
          orbit: orbitB,
          startAngle: Math.atan2(orbitB.y, orbitB.x),
          direction: dir,
          elapsed: 0,
          duration,
          entryVelocity: vec2(vb.velocity.x, vb.velocity.y),
        };

        pair.pressures[idx] = 0;
        pair.cooldowns[idx] = 0.95;
      }
    }
  }

  // Recompute per-vortex debug pressure.
  vortices[0].pressure = Math.max(pair.pressures[0], pair.pressures[1]);
  vortices[1].pressure = Math.max(pair.pressures[0], pair.pressures[2]);
  vortices[2].pressure = Math.max(pair.pressures[1], pair.pressures[2]);

  for (let i = 0; i < VORTEX_COUNT; i++) {
    if (!vortices[i].swap) reflectIntoBounds(vortices[i], params.reflectDamping);
  }
}
