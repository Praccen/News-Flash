import Shape from "../Physics/Shapes/Shape";
import Vec3 from "./Vec3";
export declare module SAT {
    /**
     * Finds how big of an overlap there is between two sets of points along a vector.
     * @param overlapVector The vector to test along.
     * @param shapeAVertices Points in set A
     * @param shapeBVertices Points in set B
     * @param reverse An object holding a variable "value" that is set to true if the vector should be flipped in order to have the vector point from dataset B towards dataset A.
     * Is set by this function.
     * @returns How big the overlap is, returns -1.0 if there is no overlap.
     */
    function getOverlap(overlapVector: Vec3, shapeAVertices: Array<Vec3>, shapeBVertices: Array<Vec3>, reverse: {
        value: boolean;
    }, margin: number): number;
    /**
     * Finds if two sets of vertices will overlap along an axis given their relative speed within the time frame (time input object).
     * Will alter the first collision time and last collision time in the times object
     * @param testVec The axis for overlap
     * @param shapeAVertices Vertices for shape A
     * @param shapeBVertices Vertices for shape B
     * @param relativeVelocity Relative velocity between the shapes
     * @param times Times object which contains - first, last, max. Max is how soon the overlap has to happen to count.
     * @returns If an overlap happens within the timeframe (times.max)
     */
    function getContinousOverlap(testVec: Vec3, shapeAVertices: Array<Vec3>, shapeBVertices: Array<Vec3>, relativeVelocity: Vec3, times: {
        first: number;
        last: number;
        max: number;
    }): boolean;
    /**
     * This will find the average point of intersection between two shapes along an axis.
     * This assumes that the shapes are intersecting and can not be used to find out IF two shapes are intersecting.
     * @param shapeA Shape A
     * @param shapeB Shape B
     * @param testAxis The axis to test along.
     * @returns The average point of intersection.
     */
    function getIntersectionPoint(shapeA: Shape, shapeB: Shape, testAxis: Vec3): Vec3;
    /**
     * Intersection testing of two shapes.
     * @param shapeA Shape A
     * @param shapeB Shape B
     * @param intersectionAxis The minimum translation vector (MTV).
     * This is the axis at which the shapes are intersecting the least.
     * Is set by this function.
     * Will always point from Shape B towards Shape A.
     * @param intersectionDepth An object holding a variable "depth" that will state how much the shapes are intersecting.
     * Is set by this function
     * @returns Boolean stating if the shapes intersect or not.
     */
    function getIntersection3D(shapeA: Shape, shapeB: Shape, intersectionAxis: Vec3, intersectionDepth: {
        depth: number;
    }): boolean;
    /**
     * Check when an intersection will occur (if it happens before timeMax).
     * @param shapeA
     * @param shapeB
     * @param velocityA
     * @param velocityB
     * @param timeMax
     * @returns Returns time of intersection if there is one within timeMax, otherwise returns -1.0
     */
    function getContinousIntersection3D(shapeA: Shape, shapeB: Shape, velocityA: Vec3, velocityB: Vec3, timeMax: number): number;
    function runUnitTests(): void;
}
