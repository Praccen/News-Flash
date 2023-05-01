import Vec3 from "../Maths/Vec3";
import ShaderProgram from "../ShaderPrograms/ShaderProgram";
export default class DirectionalLight {
    direction: Vec3;
    colour: Vec3;
    ambientMultiplier: number;
    lightProjectionBoxSideLength: number;
    private gl;
    private shaderProgram;
    constructor(gl: WebGL2RenderingContext, shaderProgram: ShaderProgram);
    bind(): void;
    calcAndSendLightSpaceMatrix(focusPos: Vec3, offset: number, uniformLocation: WebGLUniformLocation): void;
}
