uniform vec4 u_fireflyParams0;

float fireflyHash21(vec2 p) {
  p = fract(p * vec2(139.7, 449.3));
  p += dot(p, p + 19.19 + u_fireflyParams0.w * 0.00017);
  return fract(p.x * p.y);
}

vec2 fireflyHash22(vec2 p) {
  float x = fireflyHash21(p);
  float y = fireflyHash21(p + x + 37.17);
  return vec2(x, y);
}

float fireflyTwinkle(float time, float seed, float speed) {
  float slow = sin(time * (0.34 + speed * 1.46) + seed * 6.28318);
  float shimmer = sin(time * (1.2 + speed * 3.4) + seed * 12.9898);
  return clamp(0.62 + slow * 0.26 + shimmer * 0.12, 0.18, 1.0);
}

float sampleFireflyLayer(
  vec2 uv,
  float time,
  vec2 gridSize,
  float densityScale,
  float layerSeed,
  float minRadius,
  float maxRadius,
  float driftAmount
) {
  float density = clamp(u_fireflyParams0.x, 0.0, 2.0);
  float twinkleSpeed = clamp(u_fireflyParams0.z, 0.0, 3.0);
  vec2 grid = uv * gridSize;
  vec2 cell = floor(grid);
  vec2 local = fract(grid);
  float seed = fireflyHash21(cell + layerSeed);
  float occupancy = clamp(density * densityScale, 0.0, 0.92);
  float presence = smoothstep(1.0 - occupancy, 1.0, seed);

  vec2 jitter = fireflyHash22(cell + layerSeed + 11.7);
  vec2 drift = vec2(
    sin(time * (0.06 + twinkleSpeed * 0.08) + seed * 9.1),
    cos(time * (0.05 + twinkleSpeed * 0.07) + seed * 7.4)
  ) * driftAmount;
  vec2 center = clamp(vec2(0.18) + jitter * 0.64 + drift, vec2(0.08), vec2(0.92));
  vec2 delta = local - center;

  float radius = mix(minRadius, maxRadius, fireflyHash21(cell + layerSeed + 29.3));
  float core = exp(-dot(delta, delta) * radius);
  float halo = exp(-dot(delta, delta) * radius * 0.16) * 0.16;
  return presence * (core + halo) * fireflyTwinkle(time, seed, twinkleSpeed);
}

vec3 fireflyTint(vec2 uv, float time) {
  float tintSeed = fireflyHash21(floor(uv * vec2(13.0, 47.0)) + floor(time * 0.12));
  vec3 coolWhite = vec3(0.88, 0.95, 1.0);
  vec3 warmPale = vec3(1.0, 0.95, 0.78);
  return mix(coolWhite, warmPale, tintSeed * 0.28);
}

vec3 applyFireflies(vec3 color, vec2 uv, float time, BlackHoleField field) {
  float density = clamp(u_fireflyParams0.x, 0.0, 2.0);
  float brightness = clamp(u_fireflyParams0.y, 0.0, 2.0);
  if (density <= 0.0 || brightness <= 0.0) return color;

  vec2 fireflyUv = uv + field.orbitWarp * 0.18;
  float fine = sampleFireflyLayer(fireflyUv, time, vec2(31.0, 138.0), 0.052, 0.0, 48.0, 112.0, 0.025);
  float sparse = sampleFireflyLayer(fireflyUv, time * 0.78, vec2(16.0, 74.0), 0.038, 29.0, 30.0, 72.0, 0.018);
  float dust = sampleFireflyLayer(fireflyUv, time * 1.18, vec2(54.0, 236.0), 0.018, 61.0, 76.0, 160.0, 0.012);

  vec2 edgeDist = min(uv, 1.0 - uv);
  float edgeMask = smoothstep(0.0, 0.018, min(edgeDist.x, edgeDist.y));
  float eventMask = 1.0 - clamp(field.eventHorizonMask * 1.35, 0.0, 1.0);
  float lensBoost = 1.0 + clamp(field.gravityMask, 0.0, 1.0) * 0.24 + field.rimGlow * 0.08;
  float sparkle = (fine + sparse * 0.72 + dust * 0.38) * brightness * edgeMask * eventMask * lensBoost;
  sparkle = min(sparkle, 2.4);

  vec3 tint = fireflyTint(fireflyUv, time);
  color += tint * sparkle;
  color += tint * pow(max(sparkle - 0.12, 0.0), 1.45) * 0.18;
  return color;
}
