import Vec3 from "../../Maths/Vec3";
export default class Shape {
    margin: number;
    constructor();
    setUpdateNeeded(): void;
    setTransformMatrix(matrix: Matrix4): void;
    getOriginalVertices(): Array<Vec3>;
    getTransformedVertices(): Array<Vec3>;
    getTransformedNormals(): Array<Vec3>;
    getTransformedEdges(): Array<Vec3>;
    getTransformedEdgeNormals(): Array<Vec3>;
}
