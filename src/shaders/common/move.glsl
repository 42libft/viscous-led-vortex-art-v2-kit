uniform vec4 u_moveParams0;

float moveWeight(float code, float target) {
  return 1.0 - step(0.5, abs(code - target));
}

vec2 moveSafeNormalize(vec2 v) {
  return v / max(length(v), 0.0001);
}

float moveHash21(vec2 p) {
  p = fract(p * vec2(137.1, 271.7));
  p += dot(p, p + 17.17);
  return fract(p.x * p.y);
}

float moveNoise21(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(moveHash21(i), moveHash21(i + vec2(1.0, 0.0)), u.x),
    mix(moveHash21(i + vec2(0.0, 1.0)), moveHash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

vec2 moveBreathOffset(vec2 uv, float t, float intensity) {
  vec2 centered = uv - 0.5;
  float waveX = sin(uv.y * 13.2 + t * 0.33);
  float waveY = cos(uv.x * 10.6 - t * 0.27);
  float pulse = sin(t * 0.23 + dot(uv, vec2(1.8, -0.9)) * 6.28318);
  return vec2(waveX, waveY) * 0.0065 * intensity + centered * pulse * 0.004 * intensity;
}

vec2 moveStillBreath(vec2 uv, float t, float intensity) {
  return uv + moveBreathOffset(uv, t, intensity);
}

vec2 moveDirectionalFlow(vec2 uv, float t, float intensity, vec2 dir, vec2 tangent) {
  vec2 breath = moveBreathOffset(uv, t, intensity);
  float crossWave = sin(dot(uv, tangent) * 16.0 + t * 0.58);
  vec2 flow = dir * t * 0.018 * intensity;
  vec2 shear = tangent * crossWave * 0.006 * intensity;
  return uv + breath + flow + shear;
}

vec2 moveCounterFlowLayers(vec2 uv, float t, float intensity, vec2 dir, vec2 tangent) {
  vec2 breath = moveBreathOffset(uv, t, intensity) * 0.72;
  float layerWave = sin((uv.y + sin(uv.x * 6.28318) * 0.025) * 12.56636);
  float layerSign = clamp(layerWave * 1.8, -1.0, 1.0);
  float microLayer = sin(uv.y * 37.0 + t * 0.34) * 0.003 * intensity;
  vec2 parallax = dir * layerSign * t * 0.014 * intensity;
  vec2 shear = tangent * (sin(dot(uv, dir) * 15.0 - t * 0.42) * 0.004 * intensity + microLayer);
  return uv + breath + parallax + shear;
}

vec2 moveCellularPulse(vec2 uv, float t, float intensity, vec2 dir) {
  vec2 centered = uv - 0.5;
  vec2 tallCenter = centered * vec2(1.0, 2.35);
  float radial = length(tallCenter);
  float pulse = sin(t * 1.28 + radial * 15.5);
  float localPulse = moveNoise21(uv * vec2(7.5, 17.0) + vec2(t * 0.07, -t * 0.05)) - 0.5;
  vec2 radialDir = moveSafeNormalize(centered + vec2(0.0007, -0.0003));
  vec2 membranePush = radialDir * (pulse * 0.014 + localPulse * 0.012) * intensity;
  return uv + moveBreathOffset(uv, t, intensity) * 0.45 + membranePush + dir * t * 0.004 * intensity;
}

vec2 moveOilTremor(vec2 uv, float t, float intensity, vec2 dir, vec2 tangent) {
  float n1 = moveNoise21(uv * vec2(11.0, 29.0) + vec2(t * 0.28, -t * 0.21));
  float n2 = moveNoise21(uv * vec2(21.0, 9.0) - vec2(t * 0.18, t * 0.25));
  vec2 tremor = vec2(
    sin(uv.y * 52.0 + t * 3.35 + n1 * 3.2),
    sin(uv.x * 43.0 - t * 2.85 + n2 * 3.0)
  ) * 0.0038 * intensity;
  vec2 slip = dir * sin(uv.y * 18.0 + t * 0.52 + n2) * 0.006 * intensity;
  vec2 drag = tangent * sin(uv.x * 15.0 - t * 0.45 + n1) * 0.003 * intensity;
  return uv + moveBreathOffset(uv, t, intensity) * 0.36 + tremor + slip + drag;
}

vec2 moveTransitionShake(vec2 uv, float t, float intensity) {
  vec2 centered = uv - 0.5;
  float burst = 0.7 + 0.3 * sin(t * 0.9);
  vec2 jitter = vec2(
    sin(t * 26.0 + uv.y * 33.0),
    cos(t * 23.0 + uv.x * 29.0)
  ) * 0.010 * intensity * burst;
  float ripple = sin(t * 5.0 + length(centered * vec2(1.0, 2.2)) * 22.0);
  return uv + jitter + centered * ripple * 0.012 * intensity;
}

vec2 applyPatternMove(vec2 uv, float time) {
  float intensity = clamp(u_moveParams0.x, 0.0, 2.0);
  float program = u_moveParams0.y;
  float angle = u_moveParams0.z;
  float speed = max(u_moveParams0.w, 0.0);
  float t = mod(time * speed, 4096.0);
  vec2 dir = vec2(cos(angle), sin(angle));
  vec2 tangent = vec2(-dir.y, dir.x);

  vec2 breath = moveStillBreath(uv, t, intensity);
  vec2 directional = moveDirectionalFlow(uv, t, intensity, dir, tangent);
  vec2 counterFlow = moveCounterFlowLayers(uv, t, intensity, dir, tangent);
  vec2 cellularPulse = moveCellularPulse(uv, t, intensity, dir);
  vec2 oilTremor = moveOilTremor(uv, t, intensity, dir, tangent);
  vec2 transitionShake = moveTransitionShake(uv, t, intensity);

  vec2 moved = breath;
  moved = mix(moved, directional, moveWeight(program, 1.0));
  moved = mix(moved, counterFlow, moveWeight(program, 2.0));
  moved = mix(moved, cellularPulse, moveWeight(program, 3.0));
  moved = mix(moved, oilTremor, moveWeight(program, 4.0));
  moved = mix(moved, transitionShake, moveWeight(program, 5.0));
  return moved;
}
