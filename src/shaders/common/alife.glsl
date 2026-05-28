struct AlifeEffectSignals {
  float reactionEdge;
  float automataCell;
  float swarmPulse;
  float slimeTrail;
  float colonySpore;
};

float alifeHash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.21));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float alifeNoise21(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(alifeHash21(i), alifeHash21(i + vec2(1.0, 0.0)), u.x),
    mix(alifeHash21(i + vec2(0.0, 1.0)), alifeHash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float alifeFbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 3; i++) {
    value += alifeNoise21(p) * amp;
    p = mat2(1.58, 1.08, -1.08, 1.58) * p + 4.17;
    amp *= 0.52;
  }
  return value;
}

float alifeReactionEdge(vec2 uv, float time, float seed) {
  vec2 drift = vec2(time * 0.018, -time * 0.014);
  vec2 p = uv * vec2(2.8, 8.8) + seed * 0.00007;
  float activator = alifeFbm(p + drift);
  float inhibitor = alifeFbm(p * 2.55 - drift.yx * 1.35 + 13.7);
  float membrane = activator - inhibitor * 0.72;
  float band = 1.0 - smoothstep(0.025, 0.19, abs(membrane - 0.11));
  float breathing = 0.82 + 0.18 * sin(time * 0.42 + seed * 0.001);
  return clamp(band * breathing + pow(max(membrane, 0.0), 4.0) * 0.28, 0.0, 1.0);
}

float alifeLifeCellState(vec2 cell, float frame, float seed) {
  vec2 frameSeed = vec2(frame * 11.13, frame * -7.31) + seed * 0.001;
  float center = step(0.55, alifeHash21(cell + frameSeed));
  float neighbors = 0.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      if (x != 0 || y != 0) {
        vec2 offset = vec2(float(x), float(y));
        neighbors += step(0.57, alifeHash21(cell + offset + frameSeed));
      }
    }
  }

  float born = 1.0 - step(0.5, abs(neighbors - 3.0));
  float survive = 1.0 - step(0.5, abs(neighbors - 2.0));
  return max(born, center * max(born, survive));
}

float alifeAutomataCell(vec2 uv, float time, float seed) {
  vec2 grid = uv * vec2(42.0, 136.0);
  vec2 cell = floor(grid);
  vec2 f = fract(grid);
  float frame = floor(time * 2.2);
  float phase = smoothstep(0.12, 0.88, fract(time * 2.2));
  float a = alifeLifeCellState(cell, frame, seed);
  float b = alifeLifeCellState(cell, frame + 1.0, seed);
  float cellBody = 1.0 - smoothstep(0.38, 0.5, max(abs(f.x - 0.5), abs(f.y - 0.5)));
  return mix(a, b, phase) * cellBody;
}

float alifeSwarmPulse(vec2 uv, float time, float seed) {
  float field = 0.0;
  for (int i = 0; i < 7; i++) {
    float fi = float(i);
    float h = alifeHash21(vec2(fi + 0.19, seed * 0.001));
    float phase = time * (0.1 + h * 0.08) + fi * 1.71 + seed * 0.0002;
    vec2 anchor = vec2(
      alifeHash21(vec2(fi, seed * 0.002 + 3.1)),
      alifeHash21(vec2(fi + 17.0, seed * 0.002 + 9.7))
    );
    vec2 wander = 0.5 + 0.43 * vec2(
      sin(phase * 1.31 + anchor.x * 6.28318),
      cos(phase * 1.17 + anchor.y * 6.28318)
    );
    vec2 pos = mix(anchor, wander, 0.74);
    vec2 dir = normalize(vec2(cos(phase + fi), sin(phase * 1.23 - fi)) + vec2(0.001));
    vec2 d = uv - pos;
    float pointGlow = exp(-dot(d, d) * (260.0 + h * 210.0));
    float lateral = abs(d.x * dir.y - d.y * dir.x);
    float forward = abs(dot(d, dir));
    float trail = smoothstep(0.03, 0.0, lateral) * smoothstep(0.24, 0.0, forward);
    field += pointGlow + trail * 0.26;
  }
  return clamp(field * 0.22, 0.0, 1.0);
}

float alifeSlimeTrail(vec2 uv, float time, float seed) {
  float trail = 0.0;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float phase = time * (0.075 + fi * 0.006) + seed * 0.0003 + fi * 2.17;
    vec2 pos = 0.5 + 0.46 * vec2(
      sin(phase * 0.91 + fi),
      sin(phase * 1.13 + fi * 1.71)
    );
    vec2 dir = normalize(vec2(
      cos(phase + fi * 0.7),
      sin(phase * 1.19 - fi * 0.4)
    ) + vec2(0.001));
    vec2 normal = vec2(-dir.y, dir.x);
    float leftSensor = alifeFbm((uv + normal * 0.03) * vec2(7.5, 18.0) + phase);
    float rightSensor = alifeFbm((uv - normal * 0.03) * vec2(7.5, 18.0) - phase);
    float chemotaxis = 0.5 + 0.5 * sin((leftSensor - rightSensor) * 8.0 + phase);
    vec2 d = uv - pos;
    float lateral = abs(d.x * dir.y - d.y * dir.x);
    float forward = abs(dot(d, dir));
    trail += smoothstep(0.024, 0.0, lateral) * smoothstep(0.28, 0.0, forward) * (0.62 + chemotaxis * 0.38);
  }
  return clamp(trail * 0.28, 0.0, 1.0);
}

float alifeColonySpore(vec2 uv, float time, float seed) {
  vec2 p = uv * vec2(18.0, 54.0) + vec2(time * 0.035, -time * 0.018) + seed * 0.00005;
  float colony = alifeFbm(p);
  float pores = alifeNoise21(uv * vec2(86.0, 230.0) + floor(time * 3.0) + seed * 0.001);
  return smoothstep(0.72, 0.96, colony + pores * 0.18);
}

AlifeEffectSignals sampleAlifeEffectSignals(vec2 panelUv, vec2 materialUv, float time, float seed) {
  vec2 stableUv = panelUv + vec2(seed * 0.000013, seed * -0.000017);
  vec2 livingUv = materialUv + vec2(
    alifeFbm(materialUv * vec2(4.0, 12.0) + time * 0.018),
    alifeFbm(materialUv * vec2(5.5, 9.0) - time * 0.014)
  ) * 0.035;

  AlifeEffectSignals signals;
  signals.reactionEdge = alifeReactionEdge(livingUv, time, seed);
  signals.automataCell = alifeAutomataCell(stableUv, time, seed);
  signals.swarmPulse = alifeSwarmPulse(stableUv, time, seed);
  signals.slimeTrail = alifeSlimeTrail(livingUv, time, seed);
  signals.colonySpore = alifeColonySpore(livingUv, time, seed);
  return signals;
}
