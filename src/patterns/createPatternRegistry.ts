import { originalModes } from './originalModes';
import { originalPresets } from './presets/originalPresets';
import { referencePresets } from './presets/referencePresets';
import { PatternRegistry } from './PatternRegistry';
import { referenceModes } from './referenceModes';

export function createPatternRegistry(): PatternRegistry {
  return new PatternRegistry(
    [...referenceModes, ...originalModes],
    [...referencePresets, ...originalPresets],
  );
}

