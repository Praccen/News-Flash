import GraphicsObject from "./GraphicsObject";
import ShaderProgram from "../ShaderPrograms/ShaderProgram";
import Triangle from "../Physics/Shapes/Triangle";
import Vec3 from "../Maths/Vec3";
export default class PhongQuad extends GraphicsObject {
    private vertices;
    private indices;
    constructor(shaderProgram: ShaderProgram);
    setupTriangles(triangles: Array<Triangle>): void;
    getVertexPositions(): Array<Vec3>;
    draw(): void;
}
