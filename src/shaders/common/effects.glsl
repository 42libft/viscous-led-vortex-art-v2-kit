uniform vec4 u_effectParams0;

float effectHash21(vec2 p) {
  p = fract(p * vec2(173.31, 419.17));
  p += dot(p, p + 27.71);
  return fract(p.x * p.y);
}

vec3 applyEffectStack(
  vec3 color,
  vec2 grainUv,
  vec2 scanlineUv,
  float time,
  float seed,
  vec3 specularTint,
  float specularMask,
  vec4 effectScale,
  vec2 grainGrid,
  float grainFrameRate,
  float scanlineDensity
) {
  AlifeEffectSignals alife = sampleAlifeEffectSignals(grainUv, scanlineUv, time, seed);
  float glowStrength = u_effectParams0.x * effectScale.x;
  float specularStrength = u_effectParams0.y * effectScale.y;
  float grainStrength = u_effectParams0.z * effectScale.z;
  float scanlineStrength = u_effectParams0.w * effectScale.w;

  float grain = effectHash21(
    floor(grainUv * grainGrid) +
    floor(time * grainFrameRate) +
    seed * 0.0001
  ) - 0.5;
  float livingGrain =
    grain +
    (alife.automataCell - 0.5) * 0.34 +
    (alife.colonySpore - 0.5) * 0.22;

  float scanlineLife =
    0.74 +
    alife.automataCell * 0.18 +
    alife.reactionEdge * 0.08 +
    alife.swarmPulse * 0.12;
  float scanline =
    1.0 -
    smoothstep(0.44, 0.5, abs(fract(scanlineUv.y * scanlineDensity) - 0.5)) *
    scanlineStrength *
    scanlineLife;

  color +=
    specularMask *
    specularTint *
    specularStrength *
    (1.0 + alife.slimeTrail * 0.62 + alife.reactionEdge * 0.18);
  color += specularTint * alife.slimeTrail * specularStrength * 0.07;
  color += color * glowStrength * (1.0 + alife.reactionEdge * 0.26 + alife.swarmPulse * 0.2);
  color += specularTint * alife.swarmPulse * glowStrength * 0.055;
  color += vec3(livingGrain * grainStrength);
  return color * scanline;
}
