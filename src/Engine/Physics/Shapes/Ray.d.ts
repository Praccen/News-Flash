import Vec3 from "../../Maths/Vec3";
import Shape from "./Shape";
export default class Ray extends Shape {
    private start;
    private dir;
    constructor();
    setStart(start: Vec3): void;
    setDir(dir: Vec3): void;
    getDir(): Vec3;
    setStartAndDir(start: Vec3, dir: Vec3): void;
    getTransformedVertices(): Array<Vec3>;
    getTransformedNormals(): Array<Vec3>;
    getTransformedEdges(): Array<Vec3>;
    getTransformedEdgeNormals(): Array<Vec3>;
}
