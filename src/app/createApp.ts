import { WebGLRenderer } from '../renderer/WebGLRenderer';
import { DEFAULT_PANEL_SETTINGS } from '../display/panel';
import { createPatternRegistry } from '../patterns/createPatternRegistry';
import type { PatternPreset } from '../patterns/patternTypes';
import {
  blendResolvedPatterns,
  resolvePattern,
  type ResolvedPattern,
} from '../settings/presetResolver';
import { RandomAutoDirector, type AutoDirectorFrame } from '../settings/RandomAutoDirector';
import {
  applyVisualTuning,
  createVisualTuningFromPreset,
  type VisualTuningState,
} from '../settings/visualTuning';
import { VortexSystem } from '../simulation/VortexSystem';
import { createGui, type AppGui } from '../ui/gui';
import { createErrorOverlay } from './errorOverlay';
import { createFrameLoop } from './frameLoop';

export type App = {
  start: () => void;
  stop: () => void;
};

export function createApp({ canvasId }: { canvasId: string }): App {
  const overlay = createErrorOverlay();
  const patternRegistry = createPatternRegistry();
  const initialMode = patternRegistry.getDefaultMode();
  const initialPreset = patternRegistry.getDefaultPresetForMode(initialMode.id);
  const autoDirector = new RandomAutoDirector({
    registry: patternRegistry,
    initialPresetId: initialPreset.id,
  });
  const resolveTunedPattern = (
    modeId: string,
    presetId: string,
    tuning: VisualTuningState,
  ): ResolvedPattern => {
    const mode = patternRegistry.getMode(modeId);
    const preset = applyVisualTuning(patternRegistry.getPreset(presetId), tuning);
    return resolvePattern(mode, preset);
  };
  const resolvePresetPattern = (preset: PatternPreset): ResolvedPattern => {
    const mode = patternRegistry.getMode(preset.modeId);
    return resolvePattern(mode, preset);
  };
  const resolveAutoPattern = (frame: AutoDirectorFrame): ResolvedPattern => {
    const current = resolvePresetPattern(frame.currentPreset);
    if (!frame.targetPreset) return current;
    const target = resolvePresetPattern(frame.targetPreset);
    return blendResolvedPatterns(current, target, frame.blendAmount);
  };
  const initialTuning = createVisualTuningFromPreset(initialPreset);
  let currentSelection = {
    modeId: initialMode.id,
    presetId: initialPreset.id,
  };
  let activePattern: ResolvedPattern = resolveTunedPattern(
    initialMode.id,
    initialPreset.id,
    initialTuning,
  );
  let renderer: WebGLRenderer | null = null;
  let gui: AppGui | null = null;
  let lastSyncedAutoPresetId = initialPreset.id;
  const syncGuiToPreset = (preset: PatternPreset) => {
    currentSelection = {
      modeId: preset.modeId,
      presetId: preset.id,
    };
    gui?.syncSelection({
      selection: currentSelection,
      tuning: createVisualTuningFromPreset(preset),
    });
  };
  const vortexSystem = new VortexSystem();
  const loop = createFrameLoop(({ nowMs, dtMs }) => {
    if (!renderer) return;
    const timeSeconds = nowMs / 1000;
    const dtSeconds = dtMs / 1000;
    const autoFrame = autoDirector.update(dtSeconds);
    if (autoFrame.state.enabled) {
      activePattern = resolveAutoPattern(autoFrame);
      if (
        autoFrame.state.phase === 'hold' &&
        autoFrame.state.currentPresetId !== lastSyncedAutoPresetId
      ) {
        syncGuiToPreset(autoFrame.currentPreset);
        lastSyncedAutoPresetId = autoFrame.state.currentPresetId;
      }
    }
    gui?.syncAutoState(autoFrame.state);
    const physicsAspect = 1 / DEFAULT_PANEL_SETTINGS.aspect;
    vortexSystem.update({ dtSeconds, timeSeconds, physicsAspect });
    renderer.draw({
      timeSeconds,
      panelAspect: DEFAULT_PANEL_SETTINGS.aspect,
      panelScale: DEFAULT_PANEL_SETTINGS.scale,
      shaderVariant: activePattern.mode.shaderVariant,
      pattern: activePattern.uniforms,
      vortices: vortexSystem.uniforms,
    });
  });

  const start = () => {
    const canvasEl = document.getElementById(canvasId);
    if (!(canvasEl instanceof HTMLCanvasElement)) {
      const message = `Missing <canvas id="${canvasId}"> in index.html`;
      overlay.show(message);
      throw new Error(message);
    }

    try {
      renderer = new WebGLRenderer(canvasEl);
      gui = createGui({
        registry: patternRegistry,
        initialSelection: {
          modeId: activePattern.mode.id,
          presetId: activePattern.preset.id,
        },
        initialTuning,
        initialAutoState: autoDirector.getFrame().state,
        onStateChange: ({ selection, tuning }) => {
          autoDirector.setEnabled(false);
          autoDirector.setCurrentPreset(selection.presetId);
          lastSyncedAutoPresetId = selection.presetId;
          currentSelection = selection;
          activePattern = resolveTunedPattern(
            selection.modeId,
            selection.presetId,
            tuning,
          );
          gui?.syncAutoState(autoDirector.getFrame().state);
        },
        onAutoEnabledChange: (enabled) => {
          autoDirector.setCurrentPreset(currentSelection.presetId);
          autoDirector.setEnabled(enabled);
          lastSyncedAutoPresetId = currentSelection.presetId;
          const autoFrame = autoDirector.getFrame();
          if (enabled) {
            activePattern = resolveAutoPattern(autoFrame);
            syncGuiToPreset(autoFrame.currentPreset);
          } else {
            activePattern = resolvePresetPattern(autoFrame.currentPreset);
            syncGuiToPreset(autoFrame.currentPreset);
          }
          gui?.syncAutoState(autoFrame.state);
        },
        onAutoNext: () => {
          autoDirector.setCurrentPreset(currentSelection.presetId);
          autoDirector.setEnabled(true);
          autoDirector.forceNext();
          lastSyncedAutoPresetId = currentSelection.presetId;
          const autoFrame = autoDirector.getFrame();
          activePattern = resolveAutoPattern(autoFrame);
          gui?.syncAutoState(autoFrame.state);
        },
      });
      overlay.hide();
      loop.start();
    } catch (error) {
      const message =
        error instanceof Error ? error.stack ?? error.message : String(error);
      overlay.show(message);
      console.error(error);
    }
  };

  const stop = () => {
    loop.stop();
    gui?.dispose();
    gui = null;
    renderer?.dispose();
    renderer = null;
    overlay.dispose();
  };

  return { start, stop };
}
