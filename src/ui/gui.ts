import GUI from 'lil-gui';
import type { ColorScheme, MainColor } from '../colors/colorTypes';
import type { CompositionMode } from '../composition/compositionTypes';
import type { MoveIntensity, MoveProgram } from '../motion/moveTypes';
import type { PatternRegistry } from '../patterns/PatternRegistry';
import type { AutoStateSnapshot } from '../settings/RandomAutoDirector';
import { createVisualTuningFromPreset, type VisualTuningState } from '../settings/visualTuning';

export type PatternSelection = {
  modeId: string;
  presetId: string;
};

export type GuiState = {
  selection: PatternSelection;
  tuning: VisualTuningState;
};

export type AppGui = {
  syncSelection: (state: GuiState) => void;
  syncAutoState: (state: AutoStateSnapshot) => void;
  dispose: () => void;
};

type GuiModel = PatternSelection &
  VisualTuningState & {
    autoEnabled: boolean;
    autoPhase: string;
    autoTarget: string;
    autoProgress: number;
  };

const moveIntensityOptions: Record<string, MoveIntensity> = {
  Calm: 'calm',
  Normal: 'normal',
  Active: 'active',
  Violent: 'violent',
};

const mainColorOptions: Record<string, MainColor> = {
  Blue: 'blue',
  Red: 'red',
  Yellow: 'yellow',
  Green: 'green',
  White: 'white',
  Purple: 'purple',
  Pink: 'pink',
};

const colorSchemeOptions: Record<string, ColorScheme> = {
  'Same Family': 'sameFamily',
  'Same Family + Black': 'sameFamilyBlack',
  'Accent Color': 'accentColor',
  Contrast: 'contrast',
};

const compositionModeOptions: Record<string, CompositionMode> = {
  None: 'none',
  Full: 'full',
  'Random Spot': 'randomSpot',
  'Bottom Bloom': 'bottomBloom',
  'Edge Overflow': 'edgeOverflow',
  'Depth Layers': 'depthLayers',
};

const moveProgramOptions: Record<string, MoveProgram> = {
  'Still Breath': 'stillBreath',
  'Directional Flow': 'directionalFlow',
  'Counter Flow Layers': 'counterFlowLayers',
  'Cellular Pulse': 'cellularPulse',
  'Oil Tremor': 'oilTremor',
  'Transition Shake': 'transitionShake',
};

function optionMap(items: ReadonlyArray<{ id: string; label: string }>): Record<string, string> {
  return Object.fromEntries(items.map((item) => [item.label, item.id]));
}

function formatAutoPhase(auto: AutoStateSnapshot): string {
  if (!auto.enabled) return 'Manual';
  return auto.phase === 'hold' ? 'Hold' : 'Transition';
}

function formatAutoTarget(auto: AutoStateSnapshot, registry: PatternRegistry): string {
  if (!auto.enabled) return '-';
  if (!auto.targetPresetId) return registry.getPreset(auto.currentPresetId).label;
  return registry.getPreset(auto.targetPresetId).label;
}

function copyTuningToState(state: GuiModel, tuning: VisualTuningState): void {
  state.mainColor = tuning.mainColor;
  state.colorScheme = tuning.colorScheme;
  state.compositionMode = tuning.compositionMode;
  state.compositionSeed = tuning.compositionSeed;
  state.moveIntensity = tuning.moveIntensity;
  state.moveProgram = tuning.moveProgram;
  state.fireflyDensity = tuning.fireflyDensity;
  state.glow = tuning.glow;
  state.specular = tuning.specular;
  state.grain = tuning.grain;
  state.scanline = tuning.scanline;
}

function guiStateFromModel(state: GuiModel): GuiState {
  return {
    selection: {
      modeId: state.modeId,
      presetId: state.presetId,
    },
    tuning: {
      mainColor: state.mainColor,
      colorScheme: state.colorScheme,
      compositionMode: state.compositionMode,
      compositionSeed: state.compositionSeed,
      moveIntensity: state.moveIntensity,
      moveProgram: state.moveProgram,
      fireflyDensity: state.fireflyDensity,
      glow: state.glow,
      specular: state.specular,
      grain: state.grain,
      scanline: state.scanline,
    },
  };
}

export function createGui(args: {
  registry: PatternRegistry;
  initialSelection: PatternSelection;
  initialTuning: VisualTuningState;
  initialAutoState: AutoStateSnapshot;
  onStateChange: (state: GuiState) => void;
  onAutoEnabledChange: (enabled: boolean) => void;
  onAutoNext: () => void;
}): AppGui {
  const state: GuiModel = {
    ...args.initialSelection,
    ...args.initialTuning,
    autoEnabled: args.initialAutoState.enabled,
    autoPhase: formatAutoPhase(args.initialAutoState),
    autoTarget: formatAutoTarget(args.initialAutoState, args.registry),
    autoProgress: args.initialAutoState.progress,
  };
  const gui = new GUI({ title: 'Viscous Vortex' });
  gui.domElement.classList.add('app-gui');
  const compactControls = window.matchMedia('(max-width: 720px), (pointer: coarse)').matches;
  if (compactControls) gui.close();
  let autoEnabledController: { updateDisplay: () => unknown };
  let autoPhaseController: { updateDisplay: () => unknown };
  let autoTargetController: { updateDisplay: () => unknown };
  let autoProgressController: { updateDisplay: () => unknown };
  let moveIntensityController: { updateDisplay: () => unknown };
  let moveProgramController: { updateDisplay: () => unknown };
  let mainColorController: { updateDisplay: () => unknown };
  let colorSchemeController: { updateDisplay: () => unknown };
  let compositionModeController: { updateDisplay: () => unknown };
  let compositionSeedController: { updateDisplay: () => unknown };
  let fireflyDensityController: { updateDisplay: () => unknown };
  let glowController: { updateDisplay: () => unknown };
  let specularController: { updateDisplay: () => unknown };
  let grainController: { updateDisplay: () => unknown };
  let scanlineController: { updateDisplay: () => unknown };

  const emitState = () => args.onStateChange(guiStateFromModel(state));

  const updateAutoDisplays = () => {
    autoEnabledController.updateDisplay();
    autoPhaseController.updateDisplay();
    autoTargetController.updateDisplay();
    autoProgressController.updateDisplay();
  };

  const updateTuningDisplays = () => {
    mainColorController.updateDisplay();
    colorSchemeController.updateDisplay();
    compositionModeController.updateDisplay();
    compositionSeedController.updateDisplay();
    moveIntensityController.updateDisplay();
    moveProgramController.updateDisplay();
    fireflyDensityController.updateDisplay();
    glowController.updateDisplay();
    specularController.updateDisplay();
    grainController.updateDisplay();
    scanlineController.updateDisplay();
  };

  const resetTuningFromPreset = (presetId: string) => {
    copyTuningToState(state, createVisualTuningFromPreset(args.registry.getPreset(presetId)));
    updateTuningDisplays();
  };

  const modes = args.registry.getModes();
  const modeController = gui
    .add(state, 'modeId', optionMap(modes))
    .name('Mode');

  let presetController = gui
    .add(state, 'presetId', optionMap(args.registry.getPresetsForMode(state.modeId)))
    .name('Preset')
    .onChange((presetId: string) => {
      state.presetId = presetId;
      resetTuningFromPreset(presetId);
      emitState();
    });

  const autoFolder = gui.addFolder('Auto');
  autoEnabledController = autoFolder
    .add(state, 'autoEnabled')
    .name('Enabled')
    .onChange((enabled: boolean) => {
      state.autoEnabled = enabled;
      args.onAutoEnabledChange(enabled);
    });
  autoFolder.add({ next: () => args.onAutoNext() }, 'next').name('Next Random');
  autoPhaseController = autoFolder.add(state, 'autoPhase').name('Phase');
  autoTargetController = autoFolder.add(state, 'autoTarget').name('Target');
  autoProgressController = autoFolder
    .add(state, 'autoProgress', 0, 1, 0.001)
    .name('Progress');

  const colorFolder = gui.addFolder('Color');
  mainColorController = colorFolder
    .add(state, 'mainColor', mainColorOptions)
    .name('Main')
    .onChange((mainColor: MainColor) => {
      state.mainColor = mainColor;
      emitState();
    });
  colorSchemeController = colorFolder
    .add(state, 'colorScheme', colorSchemeOptions)
    .name('Scheme')
    .onChange((colorScheme: ColorScheme) => {
      state.colorScheme = colorScheme;
      emitState();
    });

  const compositionFolder = gui.addFolder('Composition');
  compositionModeController = compositionFolder
    .add(state, 'compositionMode', compositionModeOptions)
    .name('Mode')
    .onChange((compositionMode: CompositionMode) => {
      state.compositionMode = compositionMode;
      emitState();
    });
  compositionSeedController = compositionFolder
    .add(state, 'compositionSeed', 0, 99999, 1)
    .name('Seed')
    .onChange((compositionSeed: number) => {
      state.compositionSeed = compositionSeed;
      emitState();
    });

  const moveFolder = gui.addFolder('Move');
  moveIntensityController = moveFolder
    .add(state, 'moveIntensity', moveIntensityOptions)
    .name('Intensity')
    .onChange((moveIntensity: MoveIntensity) => {
      state.moveIntensity = moveIntensity;
      emitState();
    });
  moveProgramController = moveFolder
    .add(state, 'moveProgram', moveProgramOptions)
    .name('Program')
    .onChange((moveProgram: MoveProgram) => {
      state.moveProgram = moveProgram;
      emitState();
    });

  const fireflyFolder = gui.addFolder('FireflySystem');
  fireflyDensityController = fireflyFolder
    .add(state, 'fireflyDensity', 0, 2, 0.01)
    .name('Density')
    .onChange((fireflyDensity: number) => {
      state.fireflyDensity = fireflyDensity;
      emitState();
    });

  const effectFolder = gui.addFolder('Effects');
  glowController = effectFolder
    .add(state, 'glow', 0, 2, 0.01)
    .name('Glow')
    .onChange((glow: number) => {
      state.glow = glow;
      emitState();
    });
  specularController = effectFolder
    .add(state, 'specular', 0, 2, 0.01)
    .name('Specular')
    .onChange((specular: number) => {
      state.specular = specular;
      emitState();
    });
  grainController = effectFolder
    .add(state, 'grain', 0, 1, 0.01)
    .name('Grain')
    .onChange((grain: number) => {
      state.grain = grain;
      emitState();
    });
  scanlineController = effectFolder
    .add(state, 'scanline', 0, 1, 0.01)
    .name('Scanline')
    .onChange((scanline: number) => {
      state.scanline = scanline;
      emitState();
    });

  modeController.onChange((modeId: string) => {
    state.modeId = modeId;
    const defaultPreset = args.registry.getDefaultPresetForMode(modeId);
    state.presetId = defaultPreset.id;
    presetController.options(optionMap(args.registry.getPresetsForMode(modeId)));
    presetController.updateDisplay();
    resetTuningFromPreset(defaultPreset.id);
    emitState();
  });

  return {
    syncSelection: ({ selection, tuning }) => {
      state.modeId = selection.modeId;
      state.presetId = selection.presetId;
      presetController.options(optionMap(args.registry.getPresetsForMode(selection.modeId)));
      copyTuningToState(state, tuning);
      modeController.updateDisplay();
      presetController.updateDisplay();
      updateTuningDisplays();
    },
    syncAutoState: (autoState) => {
      state.autoEnabled = autoState.enabled;
      state.autoPhase = formatAutoPhase(autoState);
      state.autoTarget = formatAutoTarget(autoState, args.registry);
      state.autoProgress = autoState.progress;
      updateAutoDisplays();
    },
    dispose: () => {
      gui.destroy();
    },
  };
}
