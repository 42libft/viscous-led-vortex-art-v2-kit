import type { ShaderVariant } from '../patterns/patternTypes';
import blackHoleFieldSource from '../shaders/common/blackHoleField.glsl?raw';
import compositionCommonSource from '../shaders/common/composition.glsl?raw';
import effectsCommonSource from '../shaders/common/effects.glsl?raw';
import firefliesCommonSource from '../shaders/common/fireflies.glsl?raw';
import moveCommonSource from '../shaders/common/move.glsl?raw';
import panelCommonSource from '../shaders/common/panel.glsl?raw';
import blackHoleDebugFragmentBodySource from '../shaders/variants/blackHoleDebug.frag.glsl?raw';
import deepUniverseFragmentBodySource from '../shaders/variants/deepUniverse.frag.glsl?raw';
import liquidCellularFragmentBodySource from '../shaders/variants/liquidCellular.frag.glsl?raw';
import mineralFluidFragmentBodySource from '../shaders/variants/mineralFluid.frag.glsl?raw';

const variantSources: Record<ShaderVariant, string> = {
  'black-hole-debug': blackHoleDebugFragmentBodySource,
  'deep-universe': deepUniverseFragmentBodySource,
  'mineral-fluid': mineralFluidFragmentBodySource,
  'liquid-cellular': liquidCellularFragmentBodySource,
  'vein-botanical': blackHoleDebugFragmentBodySource,
  'oil-membrane': blackHoleDebugFragmentBodySource,
};

export function getShaderChunks(variant: ShaderVariant): ReadonlyArray<{ label: string; source: string }> {
  return [
    { label: 'common/panel.glsl', source: panelCommonSource },
    { label: 'common/blackHoleField.glsl', source: blackHoleFieldSource },
    { label: 'common/move.glsl', source: moveCommonSource },
    { label: 'common/composition.glsl', source: compositionCommonSource },
    { label: 'common/effects.glsl', source: effectsCommonSource },
    { label: 'common/fireflies.glsl', source: firefliesCommonSource },
    { label: `variants/${variant}.frag.glsl`, source: variantSources[variant] },
  ];
}
