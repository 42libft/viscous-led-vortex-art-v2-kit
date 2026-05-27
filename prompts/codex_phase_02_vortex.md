# Codex Prompt: BlackHole / Vortex Phase

Phase 3〜4の作業です。

まず以下を読んでください。

- docs/05_blackhole_vortex_spec.md
- docs/07_shader_design.md
- docs/08_implementation_plan.md

目的:

- 3つのVortexをTypeScript側で更新する。
- 黒円中心、Event Horizon、Photon Ring、Gravity Lensをshader側で実装する。
- 黒円の淵で模様が高速周回しているようなorbitWarpを作る。

重要:

- 黒円をPattern Modeの中に入れない。
- 黒円物理は `simulation/` に置く。
- blackHoleFieldは `shaders/common/` に置く。
- Mode別の見た目差分は `BlackHoleStyleParams` で扱う。
