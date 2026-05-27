import { ShaderProgram } from './ShaderProgram';
import { getShaderChunks } from './shaderRegistry';
import { buildWebGL2FragmentShader } from '../shaders/buildShader';
import type { ShaderVariant } from '../patterns/patternTypes';
import type { ResolvedPatternUniforms } from '../settings/presetResolver';
import fullscreenVertShaderSource from '../shaders/common/fullscreen.vert.glsl?raw';

export type DrawParams = {
  timeSeconds: number;
  panelAspect: number;
  panelScale: number;
  shaderVariant: ShaderVariant;
  pattern: ResolvedPatternUniforms;
  vortices: {
    pos: Float32Array;
    vel: Float32Array;
    radius: Float32Array;
    spin: Float32Array;
  };
};

type ProgramBinding = {
  program: ShaderProgram;
  uniforms: {
    resolution: WebGLUniformLocation | null;
    time: WebGLUniformLocation | null;
    panelAspect: WebGLUniformLocation | null;
    panelScale: WebGLUniformLocation | null;
    vortexPos0: WebGLUniformLocation | null;
    vortexVel0: WebGLUniformLocation | null;
    vortexRadius0: WebGLUniformLocation | null;
    vortexSpin0: WebGLUniformLocation | null;
    seed: WebGLUniformLocation | null;
    paletteA: WebGLUniformLocation | null;
    paletteB: WebGLUniformLocation | null;
    paletteC: WebGLUniformLocation | null;
    materialParams0: WebGLUniformLocation | null;
    domainParams0: WebGLUniformLocation | null;
    moveParams0: WebGLUniformLocation | null;
    compositionParams0: WebGLUniformLocation | null;
    fireflyParams0: WebGLUniformLocation | null;
    effectParams0: WebGLUniformLocation | null;
    blackHoleParams0: WebGLUniformLocation | null;
    blackHoleParams1: WebGLUniformLocation | null;
    rimColorBias: WebGLUniformLocation | null;
  };
};

export class WebGLRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGL2RenderingContext;
  private readonly programs = new Map<ShaderVariant, ProgramBinding>();
  private readonly vao: WebGLVertexArrayObject;
  private readonly positionBuffer: WebGLBuffer;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error('WebGL2 is not supported in this browser');
    this.gl = gl;

    const vao = gl.createVertexArray();
    if (!vao) throw new Error('gl.createVertexArray() failed');
    this.vao = vao;

    const positionBuffer = gl.createBuffer();
    if (!positionBuffer) throw new Error('gl.createBuffer() failed');
    this.positionBuffer = positionBuffer;

    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  }

  private getProgramBinding(shaderVariant: ShaderVariant): ProgramBinding {
    const existing = this.programs.get(shaderVariant);
    if (existing) return existing;

    const program = new ShaderProgram(this.gl, {
      vert: fullscreenVertShaderSource,
      frag: buildWebGL2FragmentShader({ chunks: getShaderChunks(shaderVariant) }),
    });
    const uniforms = {
      resolution: program.getOptionalUniformLocation('u_resolution'),
      time: program.getOptionalUniformLocation('u_time'),
      panelAspect: program.getOptionalUniformLocation('u_panelAspect'),
      panelScale: program.getOptionalUniformLocation('u_panelScale'),
      vortexPos0: program.getOptionalUniformLocation('u_vortexPos[0]'),
      vortexVel0: program.getOptionalUniformLocation('u_vortexVel[0]'),
      vortexRadius0: program.getOptionalUniformLocation('u_vortexRadius[0]'),
      vortexSpin0: program.getOptionalUniformLocation('u_vortexSpin[0]'),
      seed: program.getOptionalUniformLocation('u_seed'),
      paletteA: program.getOptionalUniformLocation('u_paletteA'),
      paletteB: program.getOptionalUniformLocation('u_paletteB'),
      paletteC: program.getOptionalUniformLocation('u_paletteC'),
      materialParams0: program.getOptionalUniformLocation('u_materialParams0'),
      domainParams0: program.getOptionalUniformLocation('u_domainParams0'),
      moveParams0: program.getOptionalUniformLocation('u_moveParams0'),
      compositionParams0: program.getOptionalUniformLocation('u_compositionParams0'),
      fireflyParams0: program.getOptionalUniformLocation('u_fireflyParams0'),
      effectParams0: program.getOptionalUniformLocation('u_effectParams0'),
      blackHoleParams0: program.getOptionalUniformLocation('u_blackHoleParams0'),
      blackHoleParams1: program.getOptionalUniformLocation('u_blackHoleParams1'),
      rimColorBias: program.getOptionalUniformLocation('u_rimColorBias'),
    };
    const binding = { program, uniforms };
    this.programs.set(shaderVariant, binding);
    return binding;
  }

  private resizeToDisplaySize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const nextWidth = Math.max(1, Math.floor(this.canvas.clientWidth * dpr));
    const nextHeight = Math.max(1, Math.floor(this.canvas.clientHeight * dpr));
    if (this.canvas.width === nextWidth && this.canvas.height === nextHeight) return;
    this.canvas.width = nextWidth;
    this.canvas.height = nextHeight;
  }

  draw(params: DrawParams): void {
    this.resizeToDisplaySize();

    const gl = this.gl;
    const binding = this.getProgramBinding(params.shaderVariant);
    const uniforms = binding.uniforms;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(binding.program.handle);
    gl.bindVertexArray(this.vao);
    gl.uniform2f(uniforms.resolution, this.canvas.width, this.canvas.height);
    gl.uniform1f(uniforms.time, params.timeSeconds);
    gl.uniform1f(uniforms.panelAspect, params.panelAspect);
    gl.uniform1f(uniforms.panelScale, params.panelScale);
    gl.uniform1f(uniforms.seed, params.pattern.seed);
    gl.uniform3f(uniforms.paletteA, ...params.pattern.paletteA);
    gl.uniform3f(uniforms.paletteB, ...params.pattern.paletteB);
    gl.uniform3f(uniforms.paletteC, ...params.pattern.paletteC);
    gl.uniform4f(uniforms.materialParams0, ...params.pattern.materialParams0);
    gl.uniform4f(uniforms.domainParams0, ...params.pattern.domainParams0);
    gl.uniform4f(uniforms.moveParams0, ...params.pattern.moveParams0);
    gl.uniform4f(uniforms.compositionParams0, ...params.pattern.compositionParams0);
    gl.uniform4f(uniforms.fireflyParams0, ...params.pattern.fireflyParams0);
    gl.uniform4f(uniforms.effectParams0, ...params.pattern.effectParams0);
    gl.uniform4f(uniforms.blackHoleParams0, ...params.pattern.blackHoleParams0);
    gl.uniform4f(uniforms.blackHoleParams1, ...params.pattern.blackHoleParams1);
    gl.uniform3f(uniforms.rimColorBias, ...params.pattern.rimColorBias);
    gl.uniform2fv(uniforms.vortexPos0, params.vortices.pos);
    gl.uniform2fv(uniforms.vortexVel0, params.vortices.vel);
    gl.uniform1fv(uniforms.vortexRadius0, params.vortices.radius);
    gl.uniform1fv(uniforms.vortexSpin0, params.vortices.spin);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  dispose(): void {
    for (const binding of this.programs.values()) binding.program.dispose();
    this.programs.clear();
    this.gl.deleteVertexArray(this.vao);
    this.gl.deleteBuffer(this.positionBuffer);
  }
}
