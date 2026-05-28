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
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 19.19 + u_seed * 0.0001);
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
  for (int i = 0; i < 4; i++) {
    v += noise21(p) * a;
    p = mat2(1.6, 1.2, -1.2, 1.6) * p + 3.7;
    a *= 0.5;
  }
  return v;
}

float thinRibbon(float value, float width) {
  float wave = abs(sin(value * 3.14159265));
  return 1.0 - smoothstep(0.0, width, wave);
}

vec3 sampleUniverse(vec2 uv, float time) {
  float angle = u_domainParams0.w;
  mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 p = (uv - 0.5) * rot + 0.5;
  p = (p - 0.5) * u_domainParams0.x + 0.5;
  p.x = (p.x - 0.5) * (1.0 + u_domainParams0.y * 0.55) + 0.5;

  vec2 flow = vec2(time * 0.012, -time * 0.018);
  vec2 slowDrift = vec2(fbm(p * 2.8 + flow), fbm(p * 3.4 - flow.yx + 11.2)) - 0.5;
  vec2 q = p + slowDrift * (0.1 + u_domainParams0.z * 0.08);

  float nebulaWide = fbm(q * vec2(2.6, 7.2) + flow + u_seed * 0.00003);
  float nebulaMid = fbm(q * vec2(6.8, 13.5) - flow.yx * 1.6 + 14.2);
  float dustNoise = fbm(q * vec2(13.0, 24.0) + vec2(9.0, -3.0));
  float softCloud = smoothstep(0.22, 0.98, nebulaWide * 0.82 + nebulaMid * 0.46);
  float cyanCloud = smoothstep(0.45, 0.86, nebulaMid + nebulaWide * 0.24);
  float darkLane = smoothstep(0.54, 0.9, dustNoise) * (1.0 - smoothstep(0.68, 1.02, softCloud));

  float filamentBase =
    q.y * 11.0 +
    q.x * 4.2 +
    fbm(q * vec2(8.0, 18.0) + 23.0) * 4.8;
  float filament = thinRibbon(filamentBase, 0.13) * u_materialParams0.y;
  float violetVeil = smoothstep(0.62, 0.95, fbm(q * vec2(4.8, 9.5) + vec2(-17.0, 4.0)));

  vec3 color = mix(u_paletteA * 0.26, u_paletteB * 0.76, softCloud);
  color += u_paletteC * cyanCloud * 0.28;
  color += mix(u_paletteB, u_paletteC, 0.55) * violetVeil * 0.16;
  color = mix(color, color * vec3(0.18, 0.24, 0.44), darkLane * 0.82);
  color += filament * mix(u_paletteC, vec3(0.78, 0.82, 1.0), 0.35) * 0.2;
  color += pow(cyanCloud, 2.2) * vec3(0.02, 0.07, 0.18);

  float wetSpecular = pow(smoothstep(0.66, 0.98, nebulaMid + filament * 0.55), 3.0);
  color = applyEffectStack(
    color,
    uv,
    q,
    time,
    u_seed,
    u_paletteC,
    wetSpecular,
    vec4(0.11, 0.12, 0.055, 0.14),
    vec2(74.0, 280.0),
    24.0,
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
  vec2 patternUv = movedUv + field.lensWarp + field.orbitWarp;
  vec3 color = sampleUniverse(patternUv, u_time);
  if (compositionDepthLayerEnabled() > 0.5) {
    vec3 rearColor = sampleUniverse(compositionDepthLayerUv(patternUv, panel.uv, u_time, -1.0), u_time);
    vec3 frontColor = sampleUniverse(compositionDepthLayerUv(patternUv, panel.uv, u_time, 1.0), u_time);
    color = blendDepthLayerComposition(rearColor, color, frontColor, panel.uv);
  } else {
    color = applyCompositionMask(color, panel.uv);
  }
  color = mix(color, vec3(0.0), field.influence * 0.12);
  color += field.gravityMask * vec3(0.02, 0.06, 0.18);
  color += field.photonRingMask * u_rimColorBias * 0.22;
  color += field.rimGlow * u_rimColorBias * 0.28;
  color = applyFireflies(color, panel.uv + field.lensWarp * 0.25, u_time, field);
  color = mix(color, vec3(0.0), field.eventHorizonMask);

  outColor = vec4(color, 1.0);
}
