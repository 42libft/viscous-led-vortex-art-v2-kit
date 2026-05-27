import { type Vortex, type VortexSystemParams, type VortexUniformPayload } from './vortexTypes';
import { createDefaultPairState, createDefaultVortices, updateVortices, type VortexPairState } from './vortexPhysics';

export class VortexSystem {
  readonly vortices: Vortex[];
  readonly uniforms: VortexUniformPayload;
  readonly params: VortexSystemParams;

  private readonly pair: VortexPairState;

  constructor(params?: Partial<VortexSystemParams>) {
    this.vortices = createDefaultVortices();
    this.params = {
      speed: 1,
      storedPressure: 0.24,
      burst: 12.5,
      reflectDamping: 0.86,
      minSpeed: 0.022,
      maxSpeed: 0.074,
      ...params,
    };
    this.pair = createDefaultPairState();

    this.uniforms = {
      pos: new Float32Array(3 * 2),
      vel: new Float32Array(3 * 2),
      radius: new Float32Array(3),
      spin: new Float32Array(3),
    };
    this.syncUniforms();
  }

  update(args: { dtSeconds: number; timeSeconds: number; physicsAspect: number }): void {
    updateVortices({
      vortices: this.vortices,
      pair: this.pair,
      dtSeconds: args.dtSeconds,
      timeSeconds: args.timeSeconds,
      physicsAspect: args.physicsAspect,
      params: this.params,
    });
    this.syncUniforms();
  }

  private syncUniforms(): void {
    for (let i = 0; i < 3; i++) {
      const v = this.vortices[i];
      this.uniforms.pos[i * 2 + 0] = v.position.x;
      this.uniforms.pos[i * 2 + 1] = v.position.y;
      this.uniforms.vel[i * 2 + 0] = v.velocity.x;
      this.uniforms.vel[i * 2 + 1] = v.velocity.y;
      this.uniforms.radius[i] = v.radius;
      this.uniforms.spin[i] = v.spin;
    }
  }
}

