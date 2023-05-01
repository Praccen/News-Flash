import GraphicsObject from "./GraphicsObject";
import Vec3 from "../Maths/Vec3";
import ShaderProgram from "../ShaderPrograms/ShaderProgram";
import Triangle from "../Physics/Shapes/Triangle";
export default class Mesh extends GraphicsObject {
    protected vertices: Float32Array;
    constructor(shaderProgram: ShaderProgram, vertices: Float32Array);
    setupTriangles(triangles: Array<Triangle>): void;
    getVertexPositions(): Array<Vec3>;
    draw(): void;
}
