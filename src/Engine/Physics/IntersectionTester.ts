import { SAT } from "./SAT.js";
import Vec3 from './Vec3.js'
import Triangle3D from "./Triangle3D.js";

export module IntersectionTester {
    export function identifyMeshVsMeshIntersection(meshA: Array<Triangle3D>, meshB: Array<Triangle3D>): boolean {
        let intersectionAxis = new Vec3();
        let intersectionDepth = {depth: Infinity}; 
        for (const triangleA of meshA) {
            for (const triangleB of meshB) {
                if (SAT.getIntersection3D(triangleA, triangleB, intersectionAxis, intersectionDepth)) {
                    return true;
                }
            }
        }

        return false;
    }

    // MTV is for minimum translation vector, axis get put in intersection axis, and depth in intersection depth, returns if there was an intersection
    export function identifyMeshVsMeshMTV(meshA: Array<Triangle3D>, meshB: Array<Triangle3D>, intersectionAxis: Vec3, intersectionDepth: number): boolean { 
        let intersecting = false;
        let tempIntersectionAxis = new Vec3();
        let tempIntersectionDepth = {depth: Infinity};
        for (const triangleA of meshA) {
            for (const triangleB of meshB) { 
                if (SAT.getIntersection3D(triangleA, triangleB, tempIntersectionAxis, tempIntersectionDepth)) {
                    intersecting = true;

                    // Save MTV if the depth is the shallowest so far
                    if (tempIntersectionDepth.depth < intersectionDepth) {
                        intersectionDepth = tempIntersectionDepth.depth;
                        intersectionAxis.deepAssign(tempIntersectionAxis);
                    }
                }
            }
        }
        return intersecting;
    }
}
    


