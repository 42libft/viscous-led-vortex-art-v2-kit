struct PanelUvResult {
  vec2 uv;
  float inside;
};

PanelUvResult panelUv(vec2 fragCoord, vec2 resolution, float panelAspect, float panelScale) {
  vec2 safeResolution = max(resolution, vec2(1.0));
  vec2 screenUv = fragCoord / safeResolution;

  float fit = clamp(panelScale, 0.0, 1.0);
  float safeAspect = max(panelAspect, 0.001);
  float panelHeightPx = min(safeResolution.y, safeResolution.x * safeAspect) * fit;
  float panelWidthPx = panelHeightPx / safeAspect;

  vec2 panelSizeUv = vec2(panelWidthPx / safeResolution.x, panelHeightPx / safeResolution.y);
  vec2 panelMinUv = vec2(0.5) - 0.5 * panelSizeUv;
  vec2 panelMaxUv = vec2(0.5) + 0.5 * panelSizeUv;

  vec2 localUv = (screenUv - panelMinUv) / (panelMaxUv - panelMinUv);
  float inside =
    step(panelMinUv.x, screenUv.x) *
    step(panelMinUv.y, screenUv.y) *
    step(screenUv.x, panelMaxUv.x) *
    step(screenUv.y, panelMaxUv.y);

  PanelUvResult res;
  res.uv = localUv;
  res.inside = inside;
  return res;
}
