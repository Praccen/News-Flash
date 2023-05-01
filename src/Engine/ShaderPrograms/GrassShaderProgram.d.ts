import ShaderProgram from "./ShaderProgram";
declare class GrassShaderProgram extends ShaderProgram {
    constructor();
    setupVertexAttributePointers(): void;
    setupInstancedVertexAttributePointers(): void;
}
export declare let grassShaderProgram: GrassShaderProgram;
export declare let createGrassShaderProgram: () => void;
export {};
