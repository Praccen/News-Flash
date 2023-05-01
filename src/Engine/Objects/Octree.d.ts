import Vec3 from "../Maths/Vec3";
import OBB from "../Physics/Shapes/OBB";
import Ray from "../Physics/Shapes/Ray";
import Shape from "../Physics/Shapes/Shape";
declare class TreeNode {
    obb: OBB;
    size: number;
    position: Vec3;
    children: Array<TreeNode>;
    content: Array<Shape>;
    constructor(size: number, position: Vec3);
    /**
     * Create 8 child nodes
     * @returns if new children was created. Will be false if there already exists children for this node or the sizes of the children would be smaller than minNodeSize.
     */
    private createChildren;
    private checkIfContains;
    subdivideTree(minNodeSize: number): void;
    addShape(shape: Shape, minNodeSize: number, maxShapesPerNode: number): void;
    setModelMatrix(modelMatrix: Matrix4): void;
    prune(): void;
    updateBox(): void;
    getShapesForCollision(boundingBox: OBB, shapeArray: Array<Shape>): void;
    getShapesForRayCast(ray: Ray, shapeArray: Array<Shape>, maxDistance?: number): void;
    print(): string;
}
export default class Octree {
    baseNode: TreeNode;
    minNodeSize: number;
    maxShapesPerNode: number;
    constructor(minVec: Vec3, maxVec: Vec3, smallestNodeSizeMultiplicator: number, maxShapesPerNode: number);
    addShape(shape: Shape): void;
    addShapes(shapes: Array<Shape>): void;
    /**
     * Update the transform matrix used for the triangles.
     * @param matrix Optional: Will set a new matrix to use for the triangles. If no matrix is sent, it will use the previously set matrix but mark all triangles to be updated.
     */
    setModelMatrix(matrix?: Matrix4): void;
    prune(): void;
    getShapesForCollision(boundingBox: OBB, shapeArray: Array<Shape>): void;
    getShapesForRayCast(ray: Ray, shapeArray: Array<Shape>, maxDistance?: number): void;
    getDataString(): string;
    parseOct(input: string): void;
}
export {};
