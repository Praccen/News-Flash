import ShaderProgram from "./ShaderProgram";
declare class ParticleShaderProgram extends ShaderProgram {
    constructor();
    setupVertexAttributePointers(): void;
    setupInstancedVertexAttributePointers(): void;
}
export declare let particleShaderProgram: ParticleShaderProgram;
export declare let createParticleShaderProgram: () => void;
export {};
