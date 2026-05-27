import type { EffectDefinition, EffectId } from './effectTypes';

export const effectDefinitions: EffectDefinition[] = [
  { id: 'glow', label: 'Glow', defaultStrength: 0.8 },
  { id: 'specular', label: 'Specular', defaultStrength: 0.6 },
  { id: 'grain', label: 'Grain', defaultStrength: 0.15 },
  { id: 'scanline', label: 'Scanline', defaultStrength: 0.2 },
];

export function isKnownEffect(id: EffectId): boolean {
  return effectDefinitions.some((effect) => effect.id === id);
}
