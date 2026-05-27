function assertNoVersionDirective(source: string, label: string): void {
  if (/#version\s+\d+/.test(source)) {
    throw new Error(`Shader chunk "${label}" must not contain a #version directive`);
  }
}

export function buildWebGL2FragmentShader(args: {
  chunks: ReadonlyArray<{ label: string; source: string }>;
}): string {
  const sources = args.chunks.map(({ label, source }) => {
    assertNoVersionDirective(source, label);
    return `\n// ---- ${label} ----\n${source}\n`;
  });

  return [`#version 300 es`, `precision highp float;`, ...sources].join('\n');
}

