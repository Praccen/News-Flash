import { SAT } from "../Maths/SAT.js";
import Vec3 from "../Maths/Vec3.js";
import Triangle3D from "./Triangle3D.js";
import IntersectionInformation from "./IntersectionInformation.js";

export module IntersectionTester {
	/**
	 * Will check if there is an intersection between two meshes.
	 * @param meshA List of triangles making up mesh A.
	 * @param meshB List of triangles making up mesh B.
	 * @returns if there is an intersection.
	 */
	export function identifyMeshVsMeshIntersection(
		meshA: Array<Triangle3D>,
		meshB: Array<Triangle3D>
	): boolean {
		let intersectionAxis = new Vec3();
		let intersectionDepth = { depth: Infinity };
		for (const triangleA of meshA) {
			for (const triangleB of meshB) {
				if (
					SAT.getIntersection3D(
						triangleA,
						triangleB,
						intersectionAxis,
						intersectionDepth
					)
				) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Finds the intersection information (axises, depths, and points) between two meshes, if they intersect
	 * @param meshA List of triangles making up mesh A.
	 * @param meshB List of triangles making up mesh B.
	 * @param intersectionInformation An array that gets filled with information about all intersections happening between the two meshes.
	 * @returns If there is an intersection.
	 */
	export function identifyMeshVsMeshWithInformation(
		meshA: Array<Triangle3D>,
		meshB: Array<Triangle3D>,
		intersectionInformation: Array<IntersectionInformation>
	): boolean {
		let intersecting = false;
		let tempIntersectionAxis = new Vec3();
		let tempIntersectionDepth = { depth: Infinity };

		for (let triangleA of meshA) {
			for (let triangleB of meshB) {
				if (
					SAT.getIntersection3D(
						triangleA,
						triangleB,
						tempIntersectionAxis,
						tempIntersectionDepth
					)
				) {
					intersecting = true;

					// Save information about intersection
					intersectionInformation.push(
						new IntersectionInformation(
							tempIntersectionAxis,
							tempIntersectionDepth.depth,
							SAT.getIntersectionPoint(
								triangleA,
								triangleB,
								tempIntersectionAxis
							)
						)
					);
				}
			}
		}

		return intersecting;
	}
}
