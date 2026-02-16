declare module "ogl" {
  export class Renderer {
    gl: WebGLRenderingContext & { canvas: HTMLCanvasElement };
    constructor(options?: Record<string, unknown>);
    setSize(width: number, height: number): void;
    render(options: { scene: Mesh }): void;
  }

  export class Program {
    uniforms: Record<string, { value: unknown }>;
    constructor(
      gl: WebGLRenderingContext,
      options: {
        vertex: string;
        fragment: string;
        uniforms: Record<string, { value: unknown }>;
      }
    );
  }

  export class Mesh {
    constructor(
      gl: WebGLRenderingContext,
      options: { geometry: Triangle; program: Program }
    );
  }

  export class Color {
    constructor(r?: number, g?: number, b?: number);
  }

  export class Triangle {
    constructor(gl: WebGLRenderingContext);
  }
}
