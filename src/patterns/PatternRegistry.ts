import { isKnownEffect } from '../effects/effectRegistry';
import type { PatternMode, PatternOrigin, PatternPreset } from './patternTypes';

export type AutoCandidateFilter = {
  origin?: PatternOrigin;
  modeId?: string;
};

export class PatternRegistry {
  private readonly modesById = new Map<string, PatternMode>();
  private readonly presetsById = new Map<string, PatternPreset>();
  private readonly presetsByModeId = new Map<string, PatternPreset[]>();
  private readonly modes: PatternMode[];
  private readonly presets: PatternPreset[];

  constructor(modes: PatternMode[], presets: PatternPreset[]) {
    this.modes = modes;
    this.presets = presets;
    for (const mode of modes) this.modesById.set(mode.id, mode);
    for (const preset of presets) {
      this.presetsById.set(preset.id, preset);
      const list = this.presetsByModeId.get(preset.modeId) ?? [];
      list.push(preset);
      this.presetsByModeId.set(preset.modeId, list);
    }
    this.validate();
  }

  getModes(): PatternMode[] {
    return [...this.modes];
  }

  getModesByOrigin(origin: PatternOrigin): PatternMode[] {
    return this.modes.filter((mode) => mode.origin === origin);
  }

  getDefaultMode(): PatternMode {
    const mode = this.modes[0];
    if (!mode) throw new Error('PatternRegistry has no modes');
    return mode;
  }

  getMode(id: string): PatternMode {
    const mode = this.modesById.get(id);
    if (!mode) throw new Error(`Unknown pattern mode: ${id}`);
    return mode;
  }

  getPreset(id: string): PatternPreset {
    const preset = this.presetsById.get(id);
    if (!preset) throw new Error(`Unknown pattern preset: ${id}`);
    return preset;
  }

  getPresetsForMode(modeId: string): PatternPreset[] {
    return [...(this.presetsByModeId.get(modeId) ?? [])];
  }

  getDefaultPresetForMode(modeId: string): PatternPreset {
    const mode = this.getMode(modeId);
    return this.getPreset(mode.defaultPresetId);
  }

  getAutoCandidates(filter: AutoCandidateFilter = {}): PatternPreset[] {
    return this.presets.filter((preset) => {
      if ((preset.autoWeight ?? 1) <= 0) return false;
      if (filter.origin && preset.origin !== filter.origin) return false;
      if (filter.modeId && preset.modeId !== filter.modeId) return false;
      return true;
    });
  }

  validate(): void {
    const ids = new Set<string>();
    for (const mode of this.modes) {
      if (ids.has(mode.id)) throw new Error(`Duplicate pattern mode id: ${mode.id}`);
      ids.add(mode.id);
      for (const effectId of mode.allowedEffects) {
        if (!isKnownEffect(effectId)) throw new Error(`Unknown effect "${effectId}" in mode "${mode.id}"`);
      }
    }

    const presetIds = new Set<string>();
    for (const preset of this.presets) {
      if (presetIds.has(preset.id)) throw new Error(`Duplicate pattern preset id: ${preset.id}`);
      presetIds.add(preset.id);
      const mode = this.getMode(preset.modeId);
      if (mode.origin !== preset.origin) {
        throw new Error(`Preset "${preset.id}" origin does not match mode "${mode.id}"`);
      }
    }

    for (const mode of this.modes) {
      const defaultPreset = this.getPreset(mode.defaultPresetId);
      if (defaultPreset.modeId !== mode.id) {
        throw new Error(`Mode "${mode.id}" defaultPresetId points to another mode`);
      }
      if (this.getPresetsForMode(mode.id).length === 0) {
        throw new Error(`Mode "${mode.id}" has no presets`);
      }
    }
  }
}
