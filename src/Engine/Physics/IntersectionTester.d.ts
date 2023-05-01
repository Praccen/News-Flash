import IntersectionInformation from "./IntersectionInformation";
import Ray from "./Shapes/Ray";
import Shape from "./Shapes/Shape";
export declare module IntersectionTester {
    /**
     * Will check if there is an intersection between two meshes.
     * @param shapeArrayA List of shapes in physical object A.
     * @param shapeArrayB List of shapes in physical object B.
     * @returns if there is an intersection.
     */
    function identifyIntersection(shapeArrayA: Array<Shape>, shapeArrayB: Array<Shape>): boolean;
    /**
     * Finds the intersection information (axises, depths, and points) between two physical objects, if they intersect
     * @param shapeArrayA List of shapes in physical object A.
     * @param shapeArrayB List of shapes in physical object B.
     * @param intersectionInformation An array that gets filled with information about all intersections happening between the two objects.
     * @returns If there is an intersection.
     */
    function identifyIntersectionInformation(shapeArrayA: Array<Shape>, shapeArrayB: Array<Shape>, intersectionInformation: Array<IntersectionInformation>): boolean;
    /**
     * Finds the closest ray cast hit between a ray and an array of shapes
     * @param ray Ray shape
     * @param shapeArray shape array to cast against
     * @param maxDistance The furthest allowed hit
     * @param breakOnFirstHit If the first hit should be returned immediately
     * @returns the closest hit
     */
    function doRayCast(ray: Ray, shapeArray: Array<Shape>, maxDistance?: number, breakOnFirstHit?: boolean): number;
}
