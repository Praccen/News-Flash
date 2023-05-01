import Vec3 from "../../Maths/Vec3";
import Shape from "./Shape";
export default class Triangle extends Shape {
    private originalVertices;
    private originalNormal;
    private transformedVertices;
    private transformedNormals;
    private transformedEdges;
    private transformedEdgeNormals;
    private transformMatrix;
    private verticesNeedsUpdate;
    private normalNeedsUpdate;
    private edgesNeedsUpdate;
    private edgeNormalsNeedsUpdate;
    constructor();
    setVertices(vertex1: Vec3, vertex2: Vec3, vertex3: Vec3): void;
    setUpdateNeeded(): void;
    setTransformMatrix(matrix: Matrix4): void;
    getOriginalVertices(): Array<Vec3>;
    getTransformedVertices(): Array<Vec3>;
    getTransformedNormals(): Array<Vec3>;
    getTransformedEdges(): Array<Vec3>;
    getTransformedEdgeNormals(): Array<Vec3>;
}
