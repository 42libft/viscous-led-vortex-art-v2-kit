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
  float vortexCoreScale,
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
  float fieldBaseEdge = styledRadius * 0.48;
  float coreEdge = fieldBaseEdge * vortexCoreScale;
  float coreAa = max(fwidth(dist) * 1.35, radius * 0.004);
  float eventHorizon = 1.0 - smoothstep(coreEdge - coreAa, coreEdge + coreAa, dist);
  float outsideCore = smoothstep(coreEdge + coreAa * 0.2, coreEdge + coreAa * 0.95, dist);
  float fieldInner = coreEdge + coreAa * 0.35;
  float fieldOuter = fieldInner + (fieldBaseEdge * 2.55 - fieldBaseEdge * 1.28) * 1.69;
  float fieldWidth = max(fieldOuter - fieldInner, radius * 0.001);
  float fieldT = clamp((dist - fieldInner) / fieldWidth, 0.0, 1.0);
  float fieldAa = max(fwidth(dist) * 2.4, radius * 0.012);
  float gravityBand =
    smoothstep(fieldInner, fieldInner + fieldAa, dist) *
    (1.0 - smoothstep(fieldOuter - fieldAa, fieldOuter, dist)) *
    outsideCore;
  float orbitCenter = mix(fieldInner, fieldOuter, 0.54);
  float orbitWidth = max(fieldWidth * 0.47, radius * 0.001);
  float orbitBand = exp(-pow((dist - orbitCenter) / orbitWidth, 2.0)) * gravityBand;

  float phase = dot(center, vec2(37.7, 91.3)) + spin * 5.17;
  float slowA = 0.5 + 0.5 * sin(time * 0.013 + phase);
  float slowB = 0.5 + 0.5 * sin(time * 0.007 + phase * 1.73);
  float slowC = 0.5 + 0.5 * sin(time * 0.019 - phase * 0.41);
  float gravitySurge = slowA * 0.48 + slowB * 0.34 + slowC * 0.18;
  gravitySurge = gravitySurge * gravitySurge * (3.0 - 2.0 * gravitySurge);
  float gravityBreath = 0.88 + gravitySurge * 0.62;
  float dynamicGravityStrength = gravityStrength * gravityBreath;
  float dynamicSwirlStrength = swirlStrength * (0.94 + gravitySurge * 0.94);
  float dynamicOrbitSpeed = photonOrbitSpeed * (0.82 + gravitySurge * 1.55);

  float travelDot = dot(radial, velocityDir);
  float lateralDot = velocityDir.x * radial.y - velocityDir.y * radial.x;
  float speedWeight = smoothstep(0.003, 0.045, speed);
  float frontBias = smoothstep(-0.18, 0.92, travelDot);
  float rearBias = smoothstep(-0.12, 0.94, -travelDot);
  float sideGate = smoothstep(0.08, 0.62, abs(lateralDot));
  float frontFork = frontBias * sideGate * speedWeight * gravityBand;
  float rearWake = rearBias * sideGate * speedWeight * gravityBand;

  float strandA = sin(angle * 2.1 + fieldT * 18.0 - time * 0.11 * dynamicOrbitSpeed * spin + phase);
  float strandB = sin(angle * 4.7 - fieldT * 12.5 + time * 0.07 * (1.0 + gravitySurge) - phase * 0.37);
  float strandC = sin((angle + fieldT * 0.85) * photonAngularFreq + time * 0.42 * dynamicOrbitSpeed * spin);
  float strandSignal = strandA * 0.5 + strandB * 0.32 + strandC * 0.18;
  float strandGate = smoothstep(-0.16, 0.54, strandSignal);
  float matterStrands = mix(0.16, 1.2, strandGate);
  float outerCapture =
    smoothstep(0.18, 0.72, fieldT) *
    (1.0 - smoothstep(0.8, 1.0, fieldT)) *
    gravityBand *
    mix(0.18, 1.0, strandGate);
  float innerCompression =
    (1.0 - smoothstep(0.0, 0.38, fieldT)) *
    gravityBand *
    mix(0.14, 1.0, strandGate);
  float directionGate = max(frontFork, rearWake);
  float orbitMatter = gravityBand * (0.04 + orbitBand * 0.62 + directionGate * 0.34) * matterStrands;
  float orbitPower =
    photonRingStrength *
    photonRingWarp *
    dynamicSwirlStrength *
    (0.72 + gravitySurge * 1.08);

  vec2 lensMetric =
    radial * (outerCapture * 0.004 + innerCompression * 0.007) * dynamicGravityStrength +
    tangent * orbitMatter * 0.03 * orbitPower;
  lensMetric += tangent * frontFork * 0.044 * orbitPower;
  lensMetric += tangent * rearWake * 0.068 * orbitPower;
  lensMetric += velocityDir * frontFork * 0.006 * dynamicGravityStrength;
  lensMetric += -velocityDir * rearWake * 0.018 * dynamicGravityStrength;

  float orbitRipple = 0.64 + 0.36 * sin(
    angle * photonAngularFreq +
    fieldT * 16.0 +
    time * 0.58 * dynamicOrbitSpeed * spin +
    phase
  );
  vec2 orbitMetric =
    tangent * orbitMatter * photonRingWarp * photonRingStrength * (0.014 + 0.016 * orbitRipple) *
    (1.0 + gravitySurge * 0.72);
  orbitMetric += radial * outerCapture * 0.003 * dynamicGravityStrength;
  orbitMetric += tangent * frontFork * photonRingWarp * photonRingStrength * 0.025;
  orbitMetric += tangent * rearWake * photonRingWarp * photonRingStrength * 0.038;
  orbitMetric += -velocityDir * rearWake * photonRingWarp * 0.014 * (1.0 + gravitySurge * 0.35);

  BlackHoleField field;
  field.lensWarp = metricWarpToPanelUv(lensMetric, visualAspect);
  field.orbitWarp = metricWarpToPanelUv(orbitMetric, visualAspect);
  field.eventHorizonMask = eventHorizon;
  field.photonRingMask = 0.0;
  field.gravityMask = 0.0;
  field.rimGlow = 0.0;
  field.influence = 0.0;
  return field;
}
