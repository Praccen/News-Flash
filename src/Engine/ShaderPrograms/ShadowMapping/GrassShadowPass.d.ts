import ShaderProgram from "../ShaderProgram";
declare class GrassShadowPass extends ShaderProgram {
    constructor();
    setupVertexAttributePointers(): void;
    setupInstancedVertexAttributePointers(): void;
}
export declare let grassShadowPass: GrassShadowPass;
export declare let createGrassShadowPass: () => void;
export {};
