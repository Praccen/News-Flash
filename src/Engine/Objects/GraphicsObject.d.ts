import Vec3 from "../Maths/Vec3";
import Triangle from "../Physics/Shapes/Triangle";
import ShaderProgram from "../ShaderPrograms/ShaderProgram";
export default class GraphicsObject {
    shaderProgram: ShaderProgram;
    private VAO;
    private VBO;
    private EBO;
    constructor(shaderProgram: ShaderProgram);
    init(): void;
    bindVAO(): void;
    unbindVAO(): void;
    setVertexData(data: Float32Array): void;
    setIndexData(data: Int32Array): void;
    setupTriangles(triangles: Array<Triangle>): void;
    getVertexPositions(): Array<Vec3>;
    draw(): void;
}
