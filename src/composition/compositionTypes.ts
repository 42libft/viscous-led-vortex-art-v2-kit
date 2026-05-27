export type CompositionMode = 'none' | 'full' | 'randomSpot' | 'bottomBloom' | 'edgeOverflow' | 'depthLayers';

export type CompositionParams = {
  /**
   * Controls where the pattern layer appears. `none` and `full` intentionally
   * leave the pattern unmasked so patterns can stay full-panel by default.
   */
  mode: CompositionMode;
  /**
   * Seed used to derive deterministic spot, bloom, and edge placement.
   */
  seed: number;
};
