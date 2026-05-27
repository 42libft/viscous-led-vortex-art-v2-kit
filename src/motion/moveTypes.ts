export type MoveIntensity = 'calm' | 'normal' | 'active' | 'violent';

export type MoveProgram =
  | 'stillBreath'
  | 'directionalFlow'
  | 'counterFlowLayers'
  | 'cellularPulse'
  | 'oilTremor'
  | 'transitionShake';

export type MoveProgramRole = 'base' | 'patternSpecial' | 'transition';

export type MoveIntensityDefinition = {
  id: MoveIntensity;
  scale: number;
};

export type MoveProgramDefinition = {
  id: MoveProgram;
  code: number;
  role: MoveProgramRole;
};

export type MoveParams = {
  intensity: MoveIntensity;
  program: MoveProgram;
  flowAngle: number;
  speed: number;
};

export const moveIntensityDefinitions: Record<MoveIntensity, MoveIntensityDefinition> = {
  calm: { id: 'calm', scale: 0.42 },
  normal: { id: 'normal', scale: 0.72 },
  active: { id: 'active', scale: 1.05 },
  violent: { id: 'violent', scale: 1.38 },
};

export const moveProgramDefinitions: Record<MoveProgram, MoveProgramDefinition> = {
  stillBreath: { id: 'stillBreath', code: 0, role: 'base' },
  directionalFlow: { id: 'directionalFlow', code: 1, role: 'base' },
  counterFlowLayers: { id: 'counterFlowLayers', code: 2, role: 'base' },
  cellularPulse: { id: 'cellularPulse', code: 3, role: 'patternSpecial' },
  oilTremor: { id: 'oilTremor', code: 4, role: 'patternSpecial' },
  transitionShake: { id: 'transitionShake', code: 5, role: 'transition' },
};
