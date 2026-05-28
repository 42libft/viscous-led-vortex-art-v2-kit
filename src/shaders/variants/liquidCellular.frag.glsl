uniform vec2 u_resolution;
uniform float u_time;
uniform float u_panelAspect;
uniform float u_panelScale;

uniform vec2 u_vortexPos[3];
uniform vec2 u_vortexVel[3];
uniform float u_vortexRadius[3];
uniform float u_vortexSpin[3];

uniform float u_seed;
uniform vec3 u_paletteA;
uniform vec3 u_paletteB;
uniform vec3 u_paletteC;
uniform vec4 u_materialParams0;
uniform vec4 u_domainParams0;
uniform vec4 u_blackHoleParams0;
uniform vec4 u_blackHoleParams1;
uniform vec3 u_rimColorBias;

out vec4 outColor;

float hash21(vec2 p) {
  p = fract(p * vec2(251.3, 417.9));
  p += dot(p, p + 31.7 + u_seed * 0.00011);
  return fract(p.x * p.y);
}

float noise21(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    value += noise21(p) * amp;
    p = mat2(1.72, 1.08, -1.08, 1.72) * p + 5.1;
    amp *= 0.52;
  }
  return value;
}

float softCell(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float d = 1.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 o = vec2(hash21(i + g), hash21(i + g + 23.7));
      o = 0.5 + 0.44 * sin(6.28318 * o + u_time * 0.08);
      vec2 r = g + o - f;
      d = min(d, dot(r, r));
    }
  }
  return sqrt(d);
}

vec3 sampleLiquidCellular(vec2 uv, float time) {
  float angle = u_domainParams0.w;
  mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 p = (uv - 0.5) * rot + 0.5;
  p = (p - 0.5) * u_domainParams0.x + 0.5;
  p.x = (p.x - 0.5) * (1.0 + u_domainParams0.y * 0.38) + 0.5;

  vec2 flow = vec2(time * 0.016, -time * 0.025);
  vec2 warp = vec2(
    fbm(p * vec2(3.1, 8.5) + flow + 8.0),
    fbm(p * vec2(5.8, 4.1) - flow.yx + 18.0)
  ) - 0.5;
  p += warp * (0.24 + u_domainParams0.z * 0.18);

  float cell = softCell(p * vec2(4.8, 13.2));
  float microCell = softCell(p * vec2(11.5, 28.0) + vec2(7.1, 2.4));
  float shell = smoothstep(0.16, 0.3, cell) * (1.0 - smoothstep(0.38, 0.64, cell));
  float innerMembrane = smoothstep(0.12, 0.24, microCell) * (1.0 - smoothstep(0.34, 0.56, microCell));
  float river = fbm(p * vec2(3.0, 10.0) + vec2(time * 0.018, -time * 0.014));
  float veinWave = abs(sin((p.y * 12.0 + p.x * 5.0 + river * 5.2) * 3.14159265));
  float vein = (1.0 - smoothstep(0.035, 0.24, veinWave)) * u_materialParams0.y;
  float oilNoise = fbm(p * vec2(7.4, 17.5) + vec2(41.0, -9.0));
  float blackInk =
    smoothstep(0.58, 0.9, oilNoise) *
    (1.0 - smoothstep(0.16, 0.52, cell)) *
    (0.45 + 0.55 * smoothstep(0.4, 0.82, river));
  float stainedEdge = smoothstep(0.52, 0.82, fbm(p * vec2(13.0, 8.0) + 4.0)) * shell;

  vec3 color = mix(u_paletteA * 0.42, u_paletteB, smoothstep(0.22, 0.86, river));
  color = mix(color, u_paletteC, shell * 0.34 + innerMembrane * 0.18);
  color += vein * mix(u_paletteB, u_paletteC, 0.42) * 0.54;
  color += stainedEdge * vec3(0.06, 0.18, 0.13);
  color = mix(color, vec3(0.0, 0.009, 0.008), blackInk * 0.9);

  float glossyPatch = fbm(p * vec2(18.0, 34.0) + vec2(-time * 0.074, time * 0.04));
  float specular = pow(smoothstep(0.52, 0.96, glossyPatch) * (0.28 + shell + vein + innerMembrane * 0.35), 3.7);
  color = applyEffectStack(
    color,
    uv,
    p,
    time,
    u_seed,
    vec3(0.85, 1.0, 0.92),
    specular,
    vec4(0.12, 0.46, 0.06, 0.18),
    vec2(76.0, 280.0),
    22.0,
    230.0
  );
  color = (color - 0.5) * u_materialParams0.w + 0.5;
  color *= u_materialParams0.z;
  return max(color, vec3(0.0));
}

void main() {
  PanelUvResult panel = panelUv(gl_FragCoord.xy, u_resolution, u_panelAspect, u_panelScale);
  if (panel.inside < 0.5) {
    outColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  float visualAspect = 1.0 / max(u_panelAspect, 0.001);
  BlackHoleField field = emptyBlackHoleField();
  for (int i = 0; i < 3; i++) {
    BlackHoleField nextField = sampleBlackHoleField(
      panel.uv,
      u_vortexPos[i],
      u_vortexRadius[i],
      u_vortexSpin[i],
      visualAspect,
      u_time,
      u_blackHoleParams0,
      u_blackHoleParams1
    );
    field = mergeBlackHoleFields(field, nextField);
  }

  vec2 movedUv = applyPatternMove(panel.uv, u_time);
  vec2 patternUv = movedUv + field.lensWarp * 1.28 + field.orbitWarp * 1.38;
  vec3 color = sampleLiquidCellular(patternUv, u_time);
  if (compositionDepthLayerEnabled() > 0.5) {
    vec3 rearColor = sampleLiquidCellular(compositionDepthLayerUv(patternUv, panel.uv, u_time, -1.0), u_time);
    vec3 frontColor = sampleLiquidCellular(compositionDepthLayerUv(patternUv, panel.uv, u_time, 1.0), u_time);
    color = blendDepthLayerComposition(rearColor, color, frontColor, panel.uv);
  } else {
    color = applyCompositionMask(color, panel.uv);
  }
  color = mix(color, vec3(0.0), field.influence * 0.08);
  color += field.gravityMask * vec3(0.0, 0.025, 0.018);
  color += field.photonRingMask * u_rimColorBias * 0.14;
  color += field.rimGlow * u_rimColorBias * 0.16;
  color = applyFireflies(color, panel.uv + field.lensWarp * 0.25, u_time, field);
  color = mix(color, vec3(0.0), field.eventHorizonMask);

  outColor = vec4(color, 1.0);
}
