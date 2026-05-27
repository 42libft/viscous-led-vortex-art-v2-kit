import type { PatternRegistry } from '../patterns/PatternRegistry';
import type { PatternFamily, PatternPreset } from '../patterns/patternTypes';

export type AutoPhase = 'hold' | 'transition';

export type AutoTiming = {
  holdSecondsMin: number;
  holdSecondsMax: number;
  transitionSecondsMin: number;
  transitionSecondsMax: number;
};

export type AutoStateSnapshot = {
  enabled: boolean;
  currentPresetId: string;
  targetPresetId: string | null;
  phase: AutoPhase;
  elapsedSeconds: number;
  durationSeconds: number;
  progress: number;
  history: string[];
  seed: number;
};

export type AutoDirectorFrame = {
  state: AutoStateSnapshot;
  currentPreset: PatternPreset;
  targetPreset: PatternPreset | null;
  blendAmount: number;
};

export type RandomAutoDirectorOptions = {
  registry: PatternRegistry;
  initialPresetId: string;
  enabled?: boolean;
  seed?: number;
  timing?: Partial<AutoTiming>;
};

const DEFAULT_TIMING: AutoTiming = {
  holdSecondsMin: 18,
  holdSecondsMax: 34,
  transitionSecondsMin: 8,
  transitionSecondsMax: 20,
};

type InternalAutoState = Omit<
  AutoStateSnapshot,
  'elapsedSeconds' | 'durationSeconds' | 'progress' | 'history'
> & {
  elapsedSeconds: number;
  durationSeconds: number;
  history: string[];
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function smoothProgress(value: number): number {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function randomRange(random: () => number, min: number, max: number): number {
  if (max <= min) return min;
  return min + random() * (max - min);
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export class RandomAutoDirector {
  private readonly registry: PatternRegistry;
  private readonly timing: AutoTiming;
  private readonly random: () => number;
  private readonly state: InternalAutoState;

  constructor(options: RandomAutoDirectorOptions) {
    this.registry = options.registry;
    const seed = options.seed ?? Date.now();
    this.random = createSeededRandom(seed);
    this.timing = { ...DEFAULT_TIMING, ...options.timing };
    const initialPreset = this.registry.getPreset(options.initialPresetId);
    this.state = {
      enabled: options.enabled ?? false,
      currentPresetId: initialPreset.id,
      targetPresetId: null,
      phase: 'hold',
      elapsedSeconds: 0,
      durationSeconds: this.nextHoldDuration(),
      history: [initialPreset.id],
      seed,
    };
  }

  update(dtSeconds: number): AutoDirectorFrame {
    if (this.state.enabled) {
      this.state.elapsedSeconds += Math.max(0, dtSeconds);
      if (this.state.elapsedSeconds >= this.state.durationSeconds) {
        if (this.state.phase === 'hold') {
          this.beginTransition();
        } else {
          this.finishTransition();
        }
      }
    }

    return this.getFrame();
  }

  setEnabled(enabled: boolean): void {
    if (this.state.enabled === enabled) return;
    this.state.enabled = enabled;
    this.state.elapsedSeconds = 0;
    if (!enabled || this.state.phase === 'transition') {
      this.state.phase = 'hold';
      this.state.targetPresetId = null;
      this.state.durationSeconds = this.nextHoldDuration();
    }
  }

  setCurrentPreset(presetId: string): void {
    const preset = this.registry.getPreset(presetId);
    this.state.currentPresetId = preset.id;
    this.state.targetPresetId = null;
    this.state.phase = 'hold';
    this.state.elapsedSeconds = 0;
    this.state.durationSeconds = this.nextHoldDuration();
    this.pushHistory(preset.id);
  }

  forceNext(): void {
    if (this.state.phase === 'transition') {
      this.finishTransition();
    }
    this.beginTransition();
  }

  getFrame(): AutoDirectorFrame {
    const currentPreset = this.registry.getPreset(this.state.currentPresetId);
    const targetPreset = this.state.targetPresetId
      ? this.registry.getPreset(this.state.targetPresetId)
      : null;
    const progress =
      this.state.durationSeconds <= 0
        ? 1
        : this.state.elapsedSeconds / this.state.durationSeconds;
    const blendAmount =
      this.state.enabled && this.state.phase === 'transition'
        ? smoothProgress(progress)
        : 0;

    return {
      state: this.createSnapshot(progress),
      currentPreset,
      targetPreset,
      blendAmount,
    };
  }

  private beginTransition(): void {
    const nextPreset = this.pickNextPreset();
    if (!nextPreset) {
      this.state.elapsedSeconds = 0;
      this.state.durationSeconds = this.nextHoldDuration();
      return;
    }

    this.state.targetPresetId = nextPreset.id;
    this.state.phase = 'transition';
    this.state.elapsedSeconds = 0;
    this.state.durationSeconds = this.nextTransitionDuration();
  }

  private finishTransition(): void {
    if (this.state.targetPresetId) {
      this.state.currentPresetId = this.state.targetPresetId;
      this.pushHistory(this.state.currentPresetId);
    }
    this.state.targetPresetId = null;
    this.state.phase = 'hold';
    this.state.elapsedSeconds = 0;
    this.state.durationSeconds = this.nextHoldDuration();
  }

  private pickNextPreset(): PatternPreset | null {
    const currentPreset = this.registry.getPreset(this.state.currentPresetId);
    const currentFamily = this.registry.getMode(currentPreset.modeId).family;
    const candidates = this.registry
      .getAutoCandidates()
      .filter((preset) => preset.id !== currentPreset.id);

    if (candidates.length === 0) return null;

    const recentIds = new Set(this.state.history.slice(-2));
    const nonRecentCandidates = candidates.filter((preset) => !recentIds.has(preset.id));
    const recencyFiltered =
      nonRecentCandidates.length > 0 ? nonRecentCandidates : candidates;
    const familyFiltered = this.filterFamilyRun(recencyFiltered, currentFamily);
    return this.pickWeighted(familyFiltered);
  }

  private filterFamilyRun(
    candidates: PatternPreset[],
    currentFamily: PatternFamily,
  ): PatternPreset[] {
    const recentFamilies = this.state.history
      .slice(-2)
      .map((presetId) => this.registry.getMode(this.registry.getPreset(presetId).modeId).family);
    const sameFamilyRun =
      recentFamilies.length >= 2 && recentFamilies.every((family) => family === currentFamily);
    if (!sameFamilyRun) return candidates;

    const filtered = candidates.filter(
      (preset) => this.registry.getMode(preset.modeId).family !== currentFamily,
    );
    return filtered.length > 0 ? filtered : candidates;
  }

  private pickWeighted(candidates: PatternPreset[]): PatternPreset {
    let totalWeight = 0;
    for (const candidate of candidates) {
      totalWeight += Math.max(0, candidate.autoWeight ?? 1);
    }

    if (totalWeight <= 0) return candidates[0];

    let cursor = this.random() * totalWeight;
    for (const candidate of candidates) {
      cursor -= Math.max(0, candidate.autoWeight ?? 1);
      if (cursor <= 0) return candidate;
    }
    return candidates[candidates.length - 1];
  }

  private pushHistory(presetId: string): void {
    this.state.history.push(presetId);
    if (this.state.history.length > 4) this.state.history.shift();
  }

  private nextHoldDuration(): number {
    return randomRange(
      this.random,
      this.timing.holdSecondsMin,
      this.timing.holdSecondsMax,
    );
  }

  private nextTransitionDuration(): number {
    return randomRange(
      this.random,
      this.timing.transitionSecondsMin,
      this.timing.transitionSecondsMax,
    );
  }

  private createSnapshot(rawProgress: number): AutoStateSnapshot {
    return {
      enabled: this.state.enabled,
      currentPresetId: this.state.currentPresetId,
      targetPresetId: this.state.targetPresetId,
      phase: this.state.phase,
      elapsedSeconds: this.state.elapsedSeconds,
      durationSeconds: this.state.durationSeconds,
      progress: clamp01(rawProgress),
      history: [...this.state.history],
      seed: this.state.seed,
    };
  }
}
