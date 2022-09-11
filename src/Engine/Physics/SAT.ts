import Shape from "./Shape.js";
import Triangle3D from "./Triangle3D.js";
import Vec2 from "./Vec2.js";
import Vec3 from "./Vec3.js";

export module SAT {
	export function getOverlap(
		overlapVector: Vec3,
		shapeAVertices: Array<Vec3>,
		shapeBVertices: Array<Vec3>,
		reverse: { value: boolean }
	): number {
		let maxA = overlapVector.dot(shapeAVertices[0]);
		let minA = maxA;
		let maxB = overlapVector.dot(shapeBVertices[0]);
		let minB = maxB;

		let tempDot = 0.0;

		for (let i = 1; i < shapeAVertices.length; i++) {
			tempDot = overlapVector.dot(shapeAVertices[i]);
			if (tempDot < minA) {
				minA = tempDot;
			}
			if (tempDot > maxA) {
				maxA = tempDot;
			}
		}

		for (let i = 1; i < shapeBVertices.length; i++) {
			tempDot = overlapVector.dot(shapeBVertices[i]);
			if (tempDot < minB) {
				minB = tempDot;
			}
			if (tempDot > maxB) {
				maxB = tempDot;
			}
		}

		let overlap1 = maxB - minA;
		let overlap2 = maxA - minB;
		if (overlap1 >= 0.0 && overlap2 >= 0.0) {
			if (overlap1 > overlap2) {
				reverse.value = true;
				return overlap2;
			} else {
				reverse.value = false;
				return overlap1;
			}
		}

		return -1.0;
	}

	export function getIntersection3D(
		shapeA: Triangle3D,
		shapeB: Triangle3D,
		intersectionAxis: Vec3,
		intersectionDepth: { depth: number }
	): boolean {
		intersectionDepth.depth = Infinity;

		let shapeAVertices = shapeA.getTransformedVertices();
		let shapeBVertices = shapeB.getTransformedVertices();

		let shapeANormal = shapeA.getTransformedNormal();
		let reverse = { value: false };
		let overlap: number = this.getOverlap(
			shapeANormal,
			shapeAVertices,
			shapeBVertices,
			reverse
		);

		if (overlap < 0.0) {
			return false;
		}

		if (overlap < intersectionDepth.depth) {
			intersectionDepth.depth = overlap;
			intersectionAxis.deepAssign(shapeANormal);
			if (reverse.value) {
				intersectionAxis.flip();
			}
		}

		let shapeBNormal = shapeB.getTransformedNormal();
		reverse = { value: false };
		overlap = this.getOverlap(
			shapeBNormal,
			shapeAVertices,
			shapeBVertices,
			reverse
		);

		if (overlap < 0.0) {
			return false;
		}

		if (overlap < intersectionDepth.depth) {
			intersectionDepth.depth = overlap;
			intersectionAxis.deepAssign(shapeBNormal);
			if (reverse.value) {
				intersectionAxis.flip();
			}
		}

		// The triangles are intersecting along both normals
		// Two cases are possible;
		// 1. The triangles are coplanar -> We need to test the triangles in "2d", projected on the plane they are on
		// 2. The triangles are not coplanar -> We need to test the cross products of all the edges of triangleA with the edges of triangleB

		// Lets start with the coplanar possibility, which can be checked by seeing if the normals of the two triangles are perpendicular
		// Side note; If the normals are perpendicular, but the triangles are not coplanar, the previous tests would have found a seperating axis, so we wouldn't have gotten here
		let crossVector = new Vec3(shapeANormal).cross(shapeBNormal);
		if (crossVector.x == 0.0 && crossVector.y == 0.0 && crossVector.z == 0.0) {
			// Coplanar
			// Test the edge normals for all edges
			for (const AEdgeNormal of shapeA.getTransformedEdgeNormals()) {
				reverse = { value: false };
				overlap = this.getOverlap(
					AEdgeNormal,
					shapeAVertices,
					shapeBVertices,
					reverse
				);

				if (overlap < 0.0) {
					return false;
				}

				if (overlap < intersectionDepth.depth) {
					intersectionDepth.depth = overlap;
					intersectionAxis.deepAssign(shapeBNormal);
					if (reverse.value) {
						intersectionAxis.flip();
					}
				}
			}

			for (const BEdgeNormal of shapeB.getTransformedEdgeNormals()) {
				reverse = { value: false };
				overlap = this.getOverlap(
					BEdgeNormal,
					shapeAVertices,
					shapeBVertices,
					reverse
				);

				if (overlap < 0.0) {
					return false;
				}

				if (overlap < intersectionDepth.depth) {
					intersectionDepth.depth = overlap;
					intersectionAxis.deepAssign(shapeBNormal);
					if (reverse.value) {
						intersectionAxis.flip();
					}
				}
			}

			// There is an intersection, return it
			return true;
		}

		// Not coplanar
		let testVec = new Vec3();

		// Calculate cross vectors of edges and test along the results
		for (const e1 of shapeA.getTransformedEdges()) {
			for (const e2 of shapeB.getTransformedEdges()) {
				const dotProd = e1.dot(e2);
				if (dotProd < 0.99 && dotProd > -0.99) {
					testVec.deepAssign(e1);
					testVec.cross(e2).normalize();

					reverse = { value: false };
					overlap = this.getOverlap(
						testVec,
						shapeAVertices,
						shapeBVertices,
						reverse
					);

					if (overlap < 0.0) {
						return false;
					}

					if (overlap < intersectionDepth.depth) {
						intersectionDepth.depth = overlap;
						intersectionAxis.deepAssign(testVec);
						if (reverse.value) {
							intersectionAxis.flip();
						}
					}
				}
			}
		}

		return true;
	}

	export function runUnitTests() {
		// prettier-ignore
		let vertexCoords = [
            // Triangle 0
            0.0, 1.0, 0.0,
            0.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            
            // Triangle 1
            0.5, 0.5, -0.1,
            0.5, 0.5, 1.0,
            0.5, 0.0, 1.0,

            // Triangle 2
            5.0, 5.0, 0.0,
            5.0, 4.0, 0.0,
            6.0, 4.0, 0.0,
        ]

		// prettier-ignore
		let positiveTests = [
            0, 1,
        ]

		// prettier-ignore
		let negativeTests = [
            0, 2, // Coplanar
            1, 2,
        ]

		// TODO: There should probably be checks for the intersection depths and axes as well

		// Create Vec3s from the data points
		let vertexPositions = new Array<Vec3>();
		for (let i = 0; i < vertexCoords.length; i += 3) {
			vertexPositions.push(
				new Vec3({
					x: vertexCoords[i],
					y: vertexCoords[i + 1],
					z: vertexCoords[i + 2],
				})
			);
		}

		// Create triangles from the Vec3s
		let triangles = new Array<Triangle3D>();
		for (let i = 0; i < vertexPositions.length; i += 3) {
			let length = triangles.push(new Triangle3D());
			triangles[length - 1].setVertices(
				vertexPositions[i],
				vertexPositions[i + 1],
				vertexPositions[i + 2]
			);
		}

		// Test the triangles that should be intersecting, no matter the order they are tried in
		for (let i = 0; i < positiveTests.length; i += 2) {
			if (
				!SAT.getIntersection3D(
					triangles[positiveTests[i]],
					triangles[positiveTests[i + 1]],
					new Vec3(),
					{ depth: 0.0 }
				) ||
				!SAT.getIntersection3D(
					triangles[positiveTests[i + 1]],
					triangles[positiveTests[i]],
					new Vec3(),
					{ depth: 0.0 }
				)
			) {
				alert("False negative intersection test!");
				debugger;
			}
		}

		// Test the triangles that should not be intersecting, no matter the order they are tried in
		for (let i = 0; i < negativeTests.length; i += 2) {
			if (
				SAT.getIntersection3D(
					triangles[negativeTests[i]],
					triangles[negativeTests[i + 1]],
					new Vec3(),
					{ depth: 0.0 }
				) ||
				SAT.getIntersection3D(
					triangles[negativeTests[i + 1]],
					triangles[negativeTests[i]],
					new Vec3(),
					{ depth: 0.0 }
				)
			) {
				alert("False positive intersection test!");
				debugger;
			}
		}
	}
}
