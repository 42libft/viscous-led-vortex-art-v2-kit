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
  p = fract(p * vec2(313.7, 157.9));
  p += dot(p, p + 23.41 + u_seed * 0.00009);
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
    p = mat2(1.54, 0.96, -0.92, 1.58) * p + 4.8;
    a *= 0.52;
  }
  return v;
}

float lineMask(float phase, float width) {
  return 1.0 - smoothstep(0.0, width, abs(sin(phase * 3.14159265)));
}

vec3 sampleVeinBotanical(vec2 uv, float time) {
  float angle = u_domainParams0.w;
  mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 p = (uv - 0.5) * rot + 0.5;
  p = (p - 0.5) * u_domainParams0.x + 0.5;
  p.x = (p.x - 0.5) * (1.0 + u_domainParams0.y * 0.55) + 0.5;

  vec2 drift = vec2(time * 0.01, -time * 0.014);
  float tissue = fbm(p * vec2(4.6, 13.5) + drift);
  float warp = fbm(p * vec2(7.0, 18.0) + 17.0) - 0.5;
  vec2 q = p + vec2(warp * 0.045, tissue * 0.025) * (0.4 + u_domainParams0.z);

  float trunkPhase = q.x * 6.5 + sin(q.y * 7.0 + tissue * 4.0) * 0.72;
  float trunk = lineMask(trunkPhase, 0.11) * smoothstep(0.1, 0.94, q.y);
  float branchA = lineMask(q.x * 12.0 + q.y * 5.4 + warp * 4.4, 0.16);
  float branchB = lineMask(q.x * 14.0 - q.y * 6.2 + tissue * 3.8, 0.14);
  float branchGate = smoothstep(0.24, 0.78, fbm(q * vec2(3.2, 9.0) + 8.0));
  float capillary = max(branchA, branchB) * branchGate * u_materialParams0.y;
  float vein = clamp(trunk * 0.9 + capillary * 0.62, 0.0, 1.0);

  float cellWash = smoothstep(0.25, 0.88, tissue + fbm(q * vec2(10.0, 22.0)) * 0.34);
  float membrane = smoothstep(0.55, 0.86, fbm(q * vec2(9.0, 19.0) + vec2(4.0, 12.0))) * u_materialParams0.x;
  float inkEdge = smoothstep(0.72, 0.92, vein + fbm(q * 16.0) * 0.3);

  vec3 color = mix(u_paletteA * 0.7, u_paletteB, cellWash);
  color = mix(color, u_paletteC, membrane * 0.24);
  color += capillary * mix(u_paletteC, vec3(0.94, 0.26, 0.58), 0.36) * 0.34;
  color = mix(color, vec3(0.018, 0.01, 0.025), inkEdge * 0.62);
  color += trunk * vec3(0.18, 0.06, 0.04);

  float specular = pow(smoothstep(0.6, 0.98, membrane + capillary * 0.45), 3.3);
  color = applyEffectStack(
    color,
    uv,
    q,
    time,
    u_seed,
    mix(u_paletteC, vec3(1.0, 0.76, 0.9), 0.3),
    specular,
    vec4(0.1, 0.24, 0.05, 0.1),
    vec2(72.0, 270.0),
    20.0,
    220.0
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
  vec2 patternUv = movedUv + field.lensWarp * 1.08 + field.orbitWarp * 0.92;
  vec3 color = sampleVeinBotanical(patternUv, u_time);
  if (compositionDepthLayerEnabled() > 0.5) {
    vec3 rearColor = sampleVeinBotanical(compositionDepthLayerUv(patternUv, panel.uv, u_time, -1.0), u_time);
    vec3 frontColor = sampleVeinBotanical(compositionDepthLayerUv(patternUv, panel.uv, u_time, 1.0), u_time);
    color = blendDepthLayerComposition(rearColor, color, frontColor, panel.uv);
  } else {
    color = applyCompositionMask(color, panel.uv);
  }
  color = mix(color, vec3(0.0), field.influence * 0.1);
  color += field.gravityMask * vec3(0.03, 0.04, 0.12);
  color += field.photonRingMask * u_rimColorBias * 0.18;
  color += field.rimGlow * u_rimColorBias * 0.22;
  color = applyFireflies(color, panel.uv + field.lensWarp * 0.24, u_time, field);
  color = mix(color, vec3(0.0), field.eventHorizonMask);

  outColor = vec4(color, 1.0);
}
