import Vec3 from "../Maths/Vec3";
import Triangle from "../Physics/Shapes/Triangle";
import ShaderProgram from "../ShaderPrograms/ShaderProgram";
import Mesh from "./Mesh";
export default class Heightmap extends Mesh {
    imageData: Uint8ClampedArray;
    xResolution: number;
    zResolution: number;
    xQuadSize: number;
    zQuadSize: number;
    private indices;
    constructor(shaderProgram: ShaderProgram);
    setupTriangles(triangles: Array<Triangle>): void;
    private updateVertexData;
    private updateVertexHeight;
    private calculateVertexNormal;
    createPlane(xResolution: number, zResolution: number, xQuadSize: number, zQuadSize: number): void;
    /**
     *
     * @param texturePath - texture path / URL
     * @param createResolutionFromPixels - if the plane should be recreated using the resolution of the picture
     */
    readHeightDataFromTexture(texturePath: string, createResolutionFromPixels?: boolean): Promise<void>;
    getNormalFromWorldPosition(heightmapTransformMatrix: Matrix4, worldPosition: Vec3, invertedTransformMatrix?: Matrix4): Vec3;
    getHeightFromWorldPosition(heightmapTransformMatrix: Matrix4, worldPosition: Vec3, invertedTransformMatrix?: Matrix4): number;
    getHeight(x: number, z: number): number;
    getNormal(x: number, z: number): Vec3;
    getVertices(): Float32Array;
    draw(): void;
}
