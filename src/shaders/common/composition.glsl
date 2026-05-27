uniform vec4 u_compositionParams0;

float compositionWeight(float code, float target) {
  return 1.0 - step(0.5, abs(code - target));
}

float compositionWave(vec2 uv, float phase) {
  return 0.5 + 0.5 * sin(uv.x * 17.0 + uv.y * 23.0 + phase);
}

float compositionPanelDistance(vec2 uv, vec2 center) {
  vec2 delta = uv - center;
  delta.y *= 3.4;
  return length(delta);
}

float sampleRandomSpotComposition(vec2 uv, vec2 center, float radius) {
  float dist = compositionPanelDistance(uv, center);
  float core = 1.0 - smoothstep(radius * 0.28, radius, dist);
  float haze = 1.0 - smoothstep(radius * 0.72, radius * 1.9, dist);
  return clamp(max(core, haze * 0.46), 0.0, 1.0);
}

float sampleBottomBloomComposition(vec2 uv, vec2 seedPoint, float radius) {
  float height = 0.22 + radius * 0.92;
  float wave = compositionWave(uv * vec2(0.9, 1.6), seedPoint.x * 12.0);
  float lobe = 1.0 - smoothstep(height * 0.36, height, uv.y);
  float plume = 1.0 - smoothstep(height * 0.55, height * 1.38, uv.y + (wave - 0.5) * 0.08);
  float centerPull = 1.0 - smoothstep(0.32, 0.68, abs(uv.x - seedPoint.x));
  return clamp(max(lobe, plume * mix(0.58, 1.0, centerPull)), 0.0, 1.0);
}

float sampleEdgeOverflowComposition(vec2 uv, vec2 seedPoint, float radius) {
  float side = floor(clamp(seedPoint.x * 4.0, 0.0, 3.0));
  float anchor = mix(0.16, 0.84, seedPoint.y);
  float edgeDistance = uv.x;
  float alongDistance = abs(uv.y - anchor);

  if (side > 0.5 && side < 1.5) {
    edgeDistance = 1.0 - uv.x;
    alongDistance = abs(uv.y - anchor);
  } else if (side >= 1.5 && side < 2.5) {
    edgeDistance = uv.y;
    alongDistance = abs(uv.x - anchor);
  } else if (side >= 2.5) {
    edgeDistance = 1.0 - uv.y;
    alongDistance = abs(uv.x - anchor);
  }

  float reach = 0.08 + radius * 1.24;
  float core = 1.0 - smoothstep(0.0, reach, edgeDistance);
  float lobe = 1.0 - smoothstep(radius * 0.24, radius * 1.7, alongDistance);
  float tendril = 1.0 - smoothstep(0.0, reach * 1.55, edgeDistance + max(alongDistance - radius * 0.45, 0.0) * 0.34);
  float wave = compositionWave(uv * vec2(1.4, 1.0), seedPoint.y * 18.0);
  return clamp(core * mix(0.52, 1.0, lobe) + tendril * wave * 0.28, 0.0, 1.0);
}

float sampleDepthLayersComposition(vec2 uv, vec2 seedPoint) {
  float phase = seedPoint.x * 19.0 + seedPoint.y * 31.0;
  float rear = 0.5 + 0.5 * sin(uv.y * 12.0 + uv.x * 4.0 + phase);
  float front = 0.5 + 0.5 * sin((1.0 - uv.y) * 15.0 - uv.x * 7.0 + phase * 1.37);
  float rearWash = smoothstep(0.16, 0.88, rear);
  float frontRibbon = smoothstep(0.62, 0.92, front);
  return clamp(0.68 + rearWash * 0.12 + frontRibbon * 0.22, 0.0, 1.0);
}

float sampleCompositionMask(vec2 uv) {
  float mode = u_compositionParams0.x;
  vec2 seedPoint = u_compositionParams0.yz;
  float radius = max(u_compositionParams0.w, 0.001);

  float spot = sampleRandomSpotComposition(uv, seedPoint, radius);
  float bottom = sampleBottomBloomComposition(uv, seedPoint, radius);
  float edge = sampleEdgeOverflowComposition(uv, seedPoint, radius);
  float depth = sampleDepthLayersComposition(uv, seedPoint);

  float mask = 1.0;
  mask = mix(mask, spot, compositionWeight(mode, 2.0));
  mask = mix(mask, bottom, compositionWeight(mode, 3.0));
  mask = mix(mask, edge, compositionWeight(mode, 4.0));
  mask = mix(mask, depth, compositionWeight(mode, 5.0));
  return clamp(mask, 0.0, 1.0);
}

vec3 applyCompositionMask(vec3 color, vec2 uv) {
  float mode = u_compositionParams0.x;
  float mask = sampleCompositionMask(uv);
  float floorLight = mix(0.18, 0.38, compositionWeight(mode, 5.0));
  return color * mix(floorLight, 1.0, mask);
}
