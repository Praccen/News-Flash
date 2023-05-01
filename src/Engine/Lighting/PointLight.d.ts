import Vec3 from "../Maths/Vec3";
import ShaderProgram from "../ShaderPrograms/ShaderProgram";
export default class PointLight {
    position: Vec3;
    colour: Vec3;
    constant: number;
    linear: number;
    quadratic: number;
    private gl;
    private shaderProgram;
    constructor(gl: WebGL2RenderingContext, shaderProgram: ShaderProgram);
    bind(lightIndex: number): void;
}
