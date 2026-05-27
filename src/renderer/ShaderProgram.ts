type ShaderStage = 'vertex' | 'fragment';

function addLineNumbers(source: string): string {
  return source
    .split('\n')
    .map((line, index) => `${String(index + 1).padStart(4, ' ')} | ${line}`)
    .join('\n');
}

function compileShader(
  gl: WebGL2RenderingContext,
  stage: ShaderStage,
  source: string,
): WebGLShader {
  const shaderType = stage === 'vertex' ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER;
  const shader = gl.createShader(shaderType);
  if (!shader) throw new Error(`gl.createShader(${stage}) failed`);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const ok = gl.getShaderParameter(shader, gl.COMPILE_STATUS) as boolean;
  if (ok) return shader;

  const log = gl.getShaderInfoLog(shader) ?? '(no shader info log)';
  gl.deleteShader(shader);

  throw new Error(
    [
      `[GLSL] ${stage} shader compile failed`,
      log.trim(),
      '',
      addLineNumbers(source),
    ].join('\n'),
  );
}

export class ShaderProgram {
  readonly handle: WebGLProgram;
  readonly gl: WebGL2RenderingContext;

  constructor(gl: WebGL2RenderingContext, args: { vert: string; frag: string }) {
    this.gl = gl;
    const program = gl.createProgram();
    if (!program) throw new Error('gl.createProgram() failed');
    this.handle = program;

    const vertShader = compileShader(gl, 'vertex', args.vert);
    const fragShader = compileShader(gl, 'fragment', args.frag);

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    gl.detachShader(program, vertShader);
    gl.detachShader(program, fragShader);
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);

    const ok = gl.getProgramParameter(program, gl.LINK_STATUS) as boolean;
    if (ok) return;

    const log = gl.getProgramInfoLog(program) ?? '(no program info log)';
    gl.deleteProgram(program);
    throw new Error(`[GLSL] program link failed\n${log.trim()}`);
  }

  getUniformLocation(name: string): WebGLUniformLocation {
    const loc = this.gl.getUniformLocation(this.handle, name);
    if (!loc) throw new Error(`uniform not found: ${name}`);
    return loc;
  }

  getOptionalUniformLocation(name: string): WebGLUniformLocation | null {
    return this.gl.getUniformLocation(this.handle, name);
  }

  dispose(): void {
    this.gl.deleteProgram(this.handle);
  }
}
