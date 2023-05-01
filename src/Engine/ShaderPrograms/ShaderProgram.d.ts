export default class ShaderProgram {
    protected shaderProgram: WebGLProgram;
    protected uniformBindings: Map<string, WebGLUniformLocation>;
    constructor(shaderProgramName: string, vertexShaderName: string, fragmentShaderName: string, debugShaderCompilation?: boolean);
    loadShaders(shaderProgramName: string, vertexShaderString: string, fragmentShaderString: string, debugShaderCompilation: boolean): void;
    use(): void;
    setupVertexAttributePointers(): void;
    setupInstancedVertexAttributePointers(): void;
    setUniformLocation(uniformName: string): void;
    getUniformLocation(uniformName: string): [WebGLUniformLocation, boolean];
}
