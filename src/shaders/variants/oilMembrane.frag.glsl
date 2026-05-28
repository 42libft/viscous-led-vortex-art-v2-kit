uniform vec2 u_resolution;
uniform float u_time;
uniform float u_panelAspect;
uniform float u_panelScale;

uniform vec2 u_vortexPos[3];
uniform vec2 u_vortexVel[3];
uniform float u_vortexRadius[3];
uniform float u_vortexCoreScale[3];
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
  p = fract(p * vec2(197.7, 389.3));
  p += dot(p, p + 37.17 + u_seed * 0.00012);
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
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += noise21(p) * a;
    p = mat2(1.66, 1.04, -1.02, 1.64) * p + 6.2;
    a *= 0.5;
  }
  return v;
}

float softCell(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float d = 1.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 o = vec2(hash21(i + g), hash21(i + g + 19.7));
      o = 0.5 + 0.46 * sin(6.28318 * o + u_time * 0.07);
      vec2 r = g + o - f;
      d = min(d, dot(r, r));
    }
  }
  return sqrt(d);
}

vec3 sampleOilMembrane(vec2 uv, float time) {
  float angle = u_domainParams0.w;
  mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 p = (uv - 0.5) * rot + 0.5;
  p = (p - 0.5) * u_domainParams0.x + 0.5;
  p.x = (p.x - 0.5) * (1.0 + u_domainParams0.y * 0.45) + 0.5;

  vec2 flow = vec2(time * 0.018, -time * 0.022);
  vec2 slip = vec2(
    fbm(p * vec2(3.2, 7.8) + flow + 12.0),
    fbm(p * vec2(5.4, 4.4) - flow.yx + 2.0)
  ) - 0.5;
  vec2 q = p + slip * (0.3 + u_domainParams0.z * 0.16);

  float cell = softCell(q * vec2(4.5, 12.4));
  float membrane = smoothstep(0.16, 0.32, cell) * (1.0 - smoothstep(0.42, 0.72, cell));
  float river = fbm(q * vec2(3.0, 11.0) + flow * 0.8);
  float blackPool =
    smoothstep(0.56, 0.9, fbm(q * vec2(8.0, 19.0) + vec2(31.0, 4.0))) *
    (1.0 - smoothstep(0.2, 0.58, cell));
  float oilyBand = 1.0 - smoothstep(0.03, 0.23, abs(sin((q.y * 10.0 + q.x * 4.0 + river * 4.7) * 3.14159265)));
  oilyBand *= u_materialParams0.y;
  float pearlescent = smoothstep(0.55, 0.95, fbm(q * vec2(14.0, 30.0) - flow * 2.2));

  vec3 color = mix(u_paletteA * 0.35, u_paletteB, smoothstep(0.22, 0.82, river));
  color = mix(color, u_paletteC, membrane * 0.3 + pearlescent * 0.18);
  color += oilyBand * mix(u_paletteC, vec3(0.95, 0.28, 0.58), 0.35) * 0.46;
  color = mix(color, vec3(0.0, 0.006, 0.008), blackPool * 0.94);
  color += membrane * vec3(0.02, 0.08, 0.06);

  float specular = pow(smoothstep(0.54, 0.97, pearlescent + membrane + oilyBand * 0.35), 3.4);
  color = applyEffectStack(
    color,
    uv,
    q,
    time,
    u_seed,
    vec3(0.86, 1.0, 0.92),
    specular,
    vec4(0.12, 0.44, 0.08, 0.18),
    vec2(78.0, 290.0),
    24.0,
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
      u_vortexVel[i],
      u_vortexRadius[i],
      u_vortexCoreScale[i],
      u_vortexSpin[i],
      visualAspect,
      u_time,
      u_blackHoleParams0,
      u_blackHoleParams1
    );
    field = mergeBlackHoleFields(field, nextField);
  }

  vec2 movedUv = applyPatternMove(panel.uv, u_time);
  vec2 patternUv = movedUv + field.lensWarp * 1.24 + field.orbitWarp * 1.34;
  vec3 color = sampleOilMembrane(patternUv, u_time);
  if (compositionDepthLayerEnabled() > 0.5) {
    vec3 rearColor = sampleOilMembrane(compositionDepthLayerUv(patternUv, panel.uv, u_time, -1.0), u_time);
    vec3 frontColor = sampleOilMembrane(compositionDepthLayerUv(patternUv, panel.uv, u_time, 1.0), u_time);
    color = blendDepthLayerComposition(rearColor, color, frontColor, panel.uv);
  } else {
    color = applyCompositionMask(color, panel.uv);
  }
  color = mix(color, vec3(0.0), field.influence * 0.12);
  color += field.gravityMask * vec3(0.0, 0.024, 0.018);
  color += field.photonRingMask * u_rimColorBias * 0.15;
  color += field.rimGlow * u_rimColorBias * 0.18;
  color = applyFireflies(color, panel.uv + field.lensWarp * 0.26, u_time, field);
  color = mix(color, vec3(0.0), field.eventHorizonMask);

  outColor = vec4(color, 1.0);
}
