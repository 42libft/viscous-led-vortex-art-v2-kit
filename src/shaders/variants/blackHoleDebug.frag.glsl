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

vec3 sampleDebugPattern(vec2 uv, float time) {
  float angle = u_domainParams0.w;
  mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 p = (uv - 0.5) * rot + 0.5;
  p = (p - 0.5) * u_domainParams0.x + 0.5;
  p.x = (p.x - 0.5) * (1.0 + u_domainParams0.y) + 0.5;
  p += vec2(sin(p.y * 7.0 + time * 0.08), cos(p.x * 6.0 - time * 0.06)) * 0.035 * u_domainParams0.z;

  float membrane =
    sin(p.x * 18.0 + sin(p.y * 9.0 + time * 0.08 + u_seed * 0.001) * 2.2) +
    sin(p.y * 31.0 + sin(p.x * 7.0 + u_seed * 0.0007) * 1.7);
  float cellular = smoothstep(-0.25, 1.35, membrane * u_materialParams0.x);
  float vein = smoothstep(0.91, 0.99, abs(sin(p.x * 18.0 - p.y * 24.0 + sin(p.y * 8.0)))) * u_materialParams0.y;

  vec3 color = mix(u_paletteA, u_paletteB, cellular);
  color = mix(color, u_paletteC, smoothstep(0.2, 1.2, sin(p.y * 10.0 + p.x * 4.0)));
  color += vein * u_paletteC;

  float wetSpecular = pow(smoothstep(0.62, 1.0, vein + cellular * 0.2), 3.0);
  color = applyEffectStack(
    color,
    uv,
    p,
    time,
    u_seed,
    u_paletteC,
    wetSpecular,
    vec4(0.15, 0.2, 0.05, 0.22),
    vec2(72.0, 260.0),
    18.0,
    220.0
  );
  color = (color - 0.5) * u_materialParams0.w + 0.5;
  color *= u_materialParams0.z;

  return color;
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
  vec3 color = sampleDebugPattern(patternUv, u_time);
  color = applyCompositionMask(color, panel.uv);

  vec2 edgeDist = min(panel.uv, 1.0 - panel.uv);
  float edge = min(edgeDist.x, edgeDist.y);
  float border = 1.0 - smoothstep(0.0, 0.008, edge);
  color = mix(color, vec3(0.0), field.influence * 0.16);
  color += field.gravityMask * vec3(0.02, 0.10, 0.18);
  color += field.photonRingMask * u_rimColorBias * 0.32;
  color += field.rimGlow * u_rimColorBias * 0.42;
  color = applyFireflies(color, panel.uv + field.lensWarp * 0.25, u_time, field);
  color = mix(color, vec3(1.0), border * 0.06);
  color = mix(color, vec3(0.0), field.eventHorizonMask);

  outColor = vec4(color, 1.0);
}
