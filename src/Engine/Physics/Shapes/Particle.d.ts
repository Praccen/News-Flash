import Vec3 from "../../Maths/Vec3";
import Shape from "./Shape";
export default class Particle extends Shape {
    private originalVertex;
    private transformedVertex;
    private transformMatrix;
    private needsUpdate;
    constructor();
    setVertex(vertex: Vec3): void;
    setUpdateNeeded(): void;
    setTransformMatrix(matrix: Matrix4): void;
    getTransformedVertices(): Array<Vec3>;
    getTransformedNormals(): Array<Vec3>;
    getTransformedEdges(): Array<Vec3>;
    getTransformedEdgeNormals(): Array<Vec3>;
}
