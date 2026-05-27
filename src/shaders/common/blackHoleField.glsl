struct BlackHoleField {
  vec2 lensWarp;
  vec2 orbitWarp;
  float eventHorizonMask;
  float photonRingMask;
  float gravityMask;
  float rimGlow;
  float influence;
};

BlackHoleField emptyBlackHoleField() {
  BlackHoleField field;
  field.lensWarp = vec2(0.0);
  field.orbitWarp = vec2(0.0);
  field.eventHorizonMask = 0.0;
  field.photonRingMask = 0.0;
  field.gravityMask = 0.0;
  field.rimGlow = 0.0;
  field.influence = 0.0;
  return field;
}

vec2 metricWarpToPanelUv(vec2 metricWarp, float visualAspect) {
  return vec2(metricWarp.x / max(visualAspect, 0.001), metricWarp.y);
}

BlackHoleField mergeBlackHoleFields(BlackHoleField a, BlackHoleField b) {
  BlackHoleField field;
  field.lensWarp = a.lensWarp + b.lensWarp;
  field.orbitWarp = a.orbitWarp + b.orbitWarp;
  field.eventHorizonMask = max(a.eventHorizonMask, b.eventHorizonMask);
  field.photonRingMask = max(a.photonRingMask, b.photonRingMask);
  field.gravityMask = max(a.gravityMask, b.gravityMask);
  field.rimGlow = max(a.rimGlow, b.rimGlow);
  field.influence = max(a.influence, b.influence);
  return field;
}

BlackHoleField sampleBlackHoleField(
  vec2 panelUv,
  vec2 center,
  float radius,
  float spin,
  float visualAspect,
  float time,
  vec4 blackHoleParams0,
  vec4 blackHoleParams1
) {
  vec2 deltaUv = panelUv - center;
  vec2 delta = vec2(deltaUv.x * visualAspect, deltaUv.y);
  float dist = max(length(delta), 0.00001);
  vec2 radial = delta / dist;
  vec2 tangent = vec2(-radial.y, radial.x) * spin;
  float angle = atan(radial.y, radial.x);

  float coreScale = blackHoleParams0.x;
  float gravityStrength = blackHoleParams0.y;
  float gravityFalloff = blackHoleParams0.z;
  float swirlStrength = blackHoleParams0.w;
  float photonRingStrength = blackHoleParams1.x;
  float photonRingWarp = blackHoleParams1.y;
  float photonOrbitSpeed = blackHoleParams1.z;
  float photonAngularFreq = blackHoleParams1.w;

  float styledRadius = radius * coreScale;
  float eventHorizon = 1.0 - smoothstep(styledRadius * 0.36, styledRadius * 0.46, dist);
  float photonRing =
    smoothstep(radius * 0.52, radius * 0.62, dist) *
    (1.0 - smoothstep(radius * 0.95, radius * 1.18, dist));

  float gravity = exp(-(dist * dist) / (radius * radius * gravityFalloff));
  float influence = 1.0 - smoothstep(radius * 2.85, radius * 4.1, dist);

  float orbitWave = 0.5 + 0.5 * sin(angle * photonAngularFreq + time * 4.2 * photonOrbitSpeed * spin);
  vec2 lensMetric = radial * gravity * -0.009 * gravityStrength + tangent * gravity * 0.0045 * swirlStrength;
  vec2 orbitMetric = tangent * photonRing * photonRingWarp * (0.006 + 0.012 * orbitWave);

  BlackHoleField field;
  field.lensWarp = metricWarpToPanelUv(lensMetric, visualAspect);
  field.orbitWarp = metricWarpToPanelUv(orbitMetric, visualAspect);
  field.eventHorizonMask = eventHorizon;
  field.photonRingMask = photonRing * photonRingStrength;
  field.gravityMask = gravity * (1.0 - eventHorizon);
  field.rimGlow = photonRing * photonRingStrength * (0.35 + 0.65 * orbitWave);
  field.influence = influence;
  return field;
}
