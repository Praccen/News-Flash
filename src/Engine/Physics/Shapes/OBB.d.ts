import Vec3 from "../../Maths/Vec3";
import Shape from "./Shape";
export default class OBB extends Shape {
    private originalVertices;
    private originalNormals;
    private transformedVertices;
    private transformedNormals;
    private transformMatrix;
    private verticesNeedsUpdate;
    private normalsNeedsUpdate;
    constructor();
    setVertices(vertices: Array<Vec3>): void;
    setNormals(normals: Array<Vec3>): void;
    /**
     * Creates an axis aligned bounding box (AABB).
     * @param minVec Corner for the lower bound.
     * @param maxVec Corner for the upper bound.
     */
    setMinAndMaxVectors(minVec: Vec3, maxVec: Vec3): void;
    setUpdateNeeded(): void;
    setTransformMatrix(matrix: Matrix4): void;
    getTransformedVertices(): Array<Vec3>;
    getTransformedNormals(): Array<Vec3>;
    getTransformedEdges(): Array<Vec3>;
    getTransformedEdgeNormals(): Array<Vec3>;
    getTransformMatrix(): Matrix4;
}
