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
  float grain = effectHash21(
    floor(grainUv * grainGrid) +
    floor(time * grainFrameRate) +
    seed * 0.0001
  ) - 0.5;
  float scanline =
    1.0 -
    smoothstep(0.44, 0.5, abs(fract(scanlineUv.y * scanlineDensity) - 0.5)) *
    u_effectParams0.w *
    effectScale.w;

  color += specularMask * specularTint * u_effectParams0.y * effectScale.y;
  color += color * u_effectParams0.x * effectScale.x;
  color += vec3(grain * u_effectParams0.z * effectScale.z);
  return color * scanline;
}
