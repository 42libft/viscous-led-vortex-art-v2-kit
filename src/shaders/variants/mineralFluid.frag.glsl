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
  p = fract(p * vec2(269.5, 183.3));
  p += dot(p, p + 41.7 + u_seed * 0.00013);
  return fract(p.x * p.y);
}

float softCell(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float d = 1.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 o = vec2(hash21(i + g), hash21(i + g + 17.3));
      vec2 r = g + o - f;
      d = min(d, dot(r, r));
    }
  }
  return sqrt(d);
}

float washNoise(vec2 p) {
  float value = 0.0;
  float amp = 0.52;
  for (int i = 0; i < 4; i++) {
    value += hash21(floor(p)) * amp;
    p = mat2(1.32, 0.72, -0.68, 1.48) * p + 4.1;
    amp *= 0.5;
  }
  return value;
}

vec3 sampleMineral(vec2 uv, float time) {
  float angle = u_domainParams0.w;
  mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 p = (uv - 0.5) * rot + 0.5;
  p = (p - 0.5) * u_domainParams0.x + 0.5;
  p += vec2(sin(p.y * 6.0 + time * 0.018), cos(p.x * 4.0 - time * 0.014)) * 0.018 * u_domainParams0.z;

  float largeCell = softCell(p * vec2(4.2, 11.0));
  float smallCell = softCell(p * vec2(9.0, 24.0) + vec2(3.1, 7.4));
  float paperWash = washNoise(p * vec2(6.0, 16.0) + u_seed * 0.00004);
  float sediment = sin(p.y * 13.0 + sin(p.x * 8.0) * 1.8 + paperWash * 2.2) * 0.5 + 0.5;
  float shell = 1.0 - smoothstep(0.14, 0.62, largeCell);
  float innerShell = 1.0 - smoothstep(0.1, 0.48, smallCell);
  float contourWave = abs(sin((largeCell * 18.0 + sediment * 1.25) * 3.14159265));
  float contour = (1.0 - smoothstep(0.04, 0.21, contourWave)) * u_materialParams0.x;
  float lamina = smoothstep(0.53, 0.86, sediment + paperWash * 0.35);
  float mineral = smoothstep(0.18, 0.82, shell * 0.7 + lamina * 0.42 + innerShell * 0.18);
  float fractureWave = abs(sin(p.x * 18.0 + p.y * 5.5 + paperWash * 4.0));
  float fracture = (1.0 - smoothstep(0.02, 0.16, fractureWave)) * u_materialParams0.y;

  vec3 warmGround = mix(u_paletteA, vec3(1.0, 0.94, 0.82), 0.16);
  vec3 color = mix(warmGround, u_paletteB, mineral * 0.82);
  color = mix(color, u_paletteC, contour * 0.34 + innerShell * 0.08);
  color -= contour * vec3(0.18, 0.11, 0.06);
  color += fracture * mix(u_paletteC, vec3(0.9, 0.42, 0.18), 0.35) * 0.28;
  color += paperWash * vec3(0.04, 0.028, 0.012);

  float wetSpecular = pow(smoothstep(0.58, 0.98, shell + fracture + innerShell * 0.28), 3.4);
  color = applyEffectStack(
    color,
    uv,
    p,
    time,
    u_seed,
    vec3(1.0, 0.92, 0.78),
    wetSpecular,
    vec4(0.08, 0.2, 0.05, 0.1),
    vec2(70.0, 260.0),
    18.0,
    210.0
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
  vec2 patternUv = movedUv + field.lensWarp + field.orbitWarp * 0.7;
  vec3 color = sampleMineral(patternUv, u_time);
  if (compositionDepthLayerEnabled() > 0.5) {
    vec3 rearColor = sampleMineral(compositionDepthLayerUv(patternUv, panel.uv, u_time, -1.0), u_time);
    vec3 frontColor = sampleMineral(compositionDepthLayerUv(patternUv, panel.uv, u_time, 1.0), u_time);
    color = blendDepthLayerComposition(rearColor, color, frontColor, panel.uv);
  } else {
    color = applyCompositionMask(color, panel.uv);
  }
  color = mix(color, vec3(0.0), field.influence * 0.08);
  color += field.gravityMask * vec3(0.08, 0.05, 0.03);
  color += field.photonRingMask * u_rimColorBias * 0.14;
  color += field.rimGlow * u_rimColorBias * 0.18;
  color = applyFireflies(color, panel.uv + field.lensWarp * 0.22, u_time, field);
  color = mix(color, vec3(0.0), field.eventHorizonMask);

  outColor = vec4(color, 1.0);
}
