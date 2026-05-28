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
  vec2 velocity,
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
  vec2 velocityMetric = vec2(velocity.x * visualAspect, velocity.y);
  float speed = length(velocityMetric);
  vec2 velocityDir = speed > 0.0001 ? velocityMetric / speed : vec2(0.0, 1.0);
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
  float coreEdge = styledRadius * 0.78;
  float eventHorizon = 1.0 - smoothstep(coreEdge * 0.985, coreEdge * 1.025, dist);
  float outsideCore = smoothstep(coreEdge * 1.005, coreEdge * 1.08, dist);

  float photonRing =
    smoothstep(coreEdge * 1.03, coreEdge * 1.14, dist) *
    (1.0 - smoothstep(coreEdge * 1.62, coreEdge * 1.92, dist));
  float orbitBand =
    smoothstep(coreEdge * 1.08, coreEdge * 1.22, dist) *
    (1.0 - smoothstep(radius * 4.2, radius * 5.15, dist));

  float phase = dot(center, vec2(37.7, 91.3)) + spin * 5.17;
  float slowA = 0.5 + 0.5 * sin(time * 0.013 + phase);
  float slowB = 0.5 + 0.5 * sin(time * 0.007 + phase * 1.73);
  float slowC = 0.5 + 0.5 * sin(time * 0.019 - phase * 0.41);
  float gravitySurge = slowA * 0.48 + slowB * 0.34 + slowC * 0.18;
  gravitySurge = gravitySurge * gravitySurge * (3.0 - 2.0 * gravitySurge);
  float gravityBreath = 0.74 + gravitySurge * 1.28;
  float dynamicGravityStrength = gravityStrength * gravityBreath;
  float dynamicSwirlStrength = swirlStrength * (0.86 + gravitySurge * 1.85);
  float dynamicOrbitSpeed = photonOrbitSpeed * (0.72 + gravitySurge * 3.45);

  float fieldBoundary = 1.0 - smoothstep(radius * 4.25, radius * 5.3, dist);
  float gravity = exp(-(dist * dist) / (radius * radius * gravityFalloff)) * fieldBoundary * outsideCore;
  float accretionGravity = exp(-pow((dist - coreEdge * 1.56) / max(radius * 1.32, 0.0001), 2.0)) * outsideCore;

  float travelDot = dot(radial, velocityDir);
  float speedWeight = smoothstep(0.003, 0.045, speed);
  float frontBias = smoothstep(-0.18, 0.92, travelDot);
  float rearBias = smoothstep(-0.12, 0.94, -travelDot);
  float orbitBias = 0.72 + 0.18 * frontBias + 0.32 * rearBias;
  float tailStretch = rearBias * speedWeight * accretionGravity * fieldBoundary;

  float orbitWave = 0.5 + 0.5 * sin(angle * photonAngularFreq + time * 4.2 * dynamicOrbitSpeed * spin);
  float orbitShear = orbitBand * accretionGravity * orbitBias;
  vec2 lensMetric =
    radial * gravity * -0.023 * dynamicGravityStrength +
    tangent * orbitShear * 0.035 * dynamicSwirlStrength;
  lensMetric += tangent * tailStretch * 0.024 * dynamicSwirlStrength;
  lensMetric += -velocityDir * tailStretch * 0.018 * dynamicGravityStrength;

  vec2 orbitMetric =
    tangent * photonRing * photonRingWarp * (0.018 + 0.036 * orbitWave) * (1.0 + gravitySurge * 1.8);
  orbitMetric += tangent * orbitShear * photonRingWarp * 0.028 * dynamicSwirlStrength;
  orbitMetric += -velocityDir * tailStretch * photonRingWarp * 0.009 * (1.0 + gravitySurge * 0.8);

  BlackHoleField field;
  field.lensWarp = metricWarpToPanelUv(lensMetric, visualAspect);
  field.orbitWarp = metricWarpToPanelUv(orbitMetric, visualAspect);
  field.eventHorizonMask = eventHorizon;
  field.photonRingMask = photonRing * photonRingStrength * 1.25 * (1.0 + gravitySurge * 0.42);
  field.gravityMask = max(gravity * 0.92, orbitShear * 0.68) * (1.0 - eventHorizon);
  field.rimGlow = photonRing * photonRingStrength * 1.35 * (0.55 + 0.45 * orbitWave) * (1.0 + gravitySurge * 0.5);
  field.influence = photonRing * 0.12;
  return field;
}
