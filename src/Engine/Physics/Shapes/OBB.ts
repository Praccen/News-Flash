import Vec3 from "../../Maths/Vec3.js";
import Shape from "./Shape.js";

export default class OBB extends Shape {
	private originalVertices: Array<Vec3>;
	private originalNormals: Array<Vec3>;

	private transformedVertices: Array<Vec3>;
	private transformedNormals: Array<Vec3>;

	private transformMatrix: Matrix4;
	private verticesNeedsUpdate: boolean;
	private normalsNeedsUpdate: boolean;

	constructor() {
		super();
		this.originalVertices = new Array<Vec3>();
		this.originalNormals = new Array<Vec3>();
		this.transformedVertices = new Array<Vec3>();
		this.transformedNormals = new Array<Vec3>();
		this.transformMatrix = new Matrix4(null);
		this.verticesNeedsUpdate = false;
		this.normalsNeedsUpdate = false;
	}

	setVertices(vertices: Array<Vec3>) {
		this.originalVertices.length = 0;
		for (let vert of vertices) {
			this.originalVertices.push(vert);
		}

		this.verticesNeedsUpdate = true;
	}

	setNormals(normals: Array<Vec3>) {
		this.originalNormals.length = 0;
		for (let norm of normals) {
			this.originalNormals.push(norm);
		}

		this.normalsNeedsUpdate = true;
	}

	/**
	 * Creates an axis aligned bounding box (AABB).
	 * @param minVec Corner for the lower bound.
	 * @param maxVec Corner for the upper bound.
	 */
	setMinAndMaxVectors(minVec: Vec3, maxVec: Vec3) {
		this.originalNormals.length = 0;
		this.originalNormals.push(new Vec3({ x: 1.0, y: 0.0, z: 0.0 }));
		this.originalNormals.push(new Vec3({ x: 0.0, y: 1.0, z: 0.0 }));
		this.originalNormals.push(new Vec3({ x: 0.0, y: 0.0, z: 1.0 }));

		this.originalVertices.length = 0;

		for (let i = 0; i < 8; i++) {
			this.originalVertices.push(new Vec3({ x: 0.0, y: 0.0, z: 0.0 }));
		}

		this.originalVertices[0].deepAssign(minVec);
		this.originalVertices[1].setValues(minVec.x, minVec.y, maxVec.z);
		this.originalVertices[2].setValues(minVec.x, maxVec.y, minVec.z);
		this.originalVertices[3].setValues(minVec.x, maxVec.y, maxVec.z);
		this.originalVertices[4].setValues(maxVec.x, minVec.y, minVec.z);
		this.originalVertices[5].setValues(maxVec.x, minVec.y, maxVec.z);
		this.originalVertices[6].setValues(maxVec.x, maxVec.y, minVec.z);
		this.originalVertices[7].deepAssign(maxVec);

		this.normalsNeedsUpdate = true;
		this.verticesNeedsUpdate = true;
	}

	setUpdateNeeded() {
		this.verticesNeedsUpdate = true;
		this.normalsNeedsUpdate = true;
	}

	setTransformMatrix(matrix: Matrix4) {
		this.transformMatrix = matrix;
		this.verticesNeedsUpdate = true;
		this.normalsNeedsUpdate = true;
	}

	getTransformedVertices(): Array<Vec3> {
		if (this.verticesNeedsUpdate) {
			this.transformedVertices.length = 0;

			for (const originalVertex of this.originalVertices) {
				let transformedVertex = this.transformMatrix.multiplyVector4(
					new Vector4([
						originalVertex.x,
						originalVertex.y,
						originalVertex.z,
						1.0,
					])
				);
				let transformedVertexVec3 = new Vec3({
					x: transformedVertex.elements[0],
					y: transformedVertex.elements[1],
					z: transformedVertex.elements[2],
				});
				this.transformedVertices.push(transformedVertexVec3);
			}
			this.verticesNeedsUpdate = false;
		}
		return this.transformedVertices;
	}

	getTransformedNormals(): Array<Vec3> {
		if (this.normalsNeedsUpdate) {
			this.transformedNormals.length = 0;
			let tempMatrix = new Matrix4(this.transformMatrix).invert().transpose();
			for (const originalNormal of this.originalNormals) {
				let transformedNormal = tempMatrix
					.multiplyVector3(
						new Vector3([originalNormal.x, originalNormal.y, originalNormal.z])
					)
					.normalize();
				this.transformedNormals.push(
					new Vec3({
						x: transformedNormal.elements[0],
						y: transformedNormal.elements[1],
						z: transformedNormal.elements[2],
					})
				);
			}

			this.normalsNeedsUpdate = false;
		}
		return this.transformedNormals;
	}

	getTransformedEdges(): Array<Vec3> {
		return this.getTransformedNormals();
	}

	getTransformedEdgeNormals(): Array<Vec3> {
		return this.getTransformedNormals();
	}
}
