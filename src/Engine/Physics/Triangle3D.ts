import Vec3 from "./Vec3.js";

export default class Triangle3D {
	private originalVertices: Array<Vec3>;
	private originalNormal: Vec3;

	private transformedVertices: Array<Vec3>;
	private transformedNormal: Vec3;
	private transformedEdges: Array<Vec3>;
	private transformedEdgeNormals: Array<Vec3>;

	private transformMatrix: Matrix4;
	private verticesNeedsUpdate: boolean;
	private normalNeedsUpdate: boolean;
	private edgesNeedsUpdate: boolean;
	private edgeNormalsNeedsUpdate: boolean;

	constructor() {
		this.originalVertices = new Array<Vec3>();
		this.originalNormal = new Vec3();
		this.transformedVertices = new Array<Vec3>();
		this.transformedNormal = new Vec3();
		this.transformedEdges = new Array<Vec3>();
		this.transformedEdgeNormals = new Array<Vec3>();
		this.transformMatrix = new Matrix4(null);
		this.verticesNeedsUpdate = false;
		this.normalNeedsUpdate = false;
		this.edgesNeedsUpdate = false;
		this.edgeNormalsNeedsUpdate = false;
	}

	setVertices(vertex1: Vec3, vertex2: Vec3, vertex3: Vec3) {
		this.originalVertices.length = 0;
		this.transformedEdges.length = 0;
		this.originalVertices.push(vertex1);
		this.originalVertices.push(vertex2);
		this.originalVertices.push(vertex3);
		this.originalNormal.deepAssign(
			new Vec3(vertex2)
				.subtract(vertex1)
				.cross(new Vec3(vertex3).subtract(vertex2))
				.normalize()
		);

		this.verticesNeedsUpdate = true;
		this.normalNeedsUpdate = true;
		this.edgesNeedsUpdate = true;
		this.edgeNormalsNeedsUpdate = true;
	}

	setTransformMatrix(matrix: Matrix4) {
		this.transformMatrix = matrix;
		this.verticesNeedsUpdate = true;
		this.normalNeedsUpdate = true;
		this.edgesNeedsUpdate = true;
		this.edgeNormalsNeedsUpdate = true;
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

	getTransformedNormal(): Vec3 {
		if (this.normalNeedsUpdate) {
			let tempMatrix = new Matrix4(this.transformMatrix);
			let transformedNormal = tempMatrix
				.invert()
				.transpose()
				.multiplyVector3(
					new Vector3([
						this.originalNormal.x,
						this.originalNormal.y,
						this.originalNormal.z,
					])
				)
				.normalize();
			this.transformedNormal = new Vec3({
				x: transformedNormal.elements[0],
				y: transformedNormal.elements[1],
				z: transformedNormal.elements[2],
			});
			this.normalNeedsUpdate = false;
		}
		return this.transformedNormal;
	}

	getTransformedEdges(): Array<Vec3> {
		if (this.edgesNeedsUpdate) {
			this.getTransformedVertices(); // Force update of vertices
			this.transformedEdges.length = 0;

			this.transformedEdges.push(
				new Vec3(this.transformedVertices[1])
					.subtract(this.transformedVertices[0])
					.normalize()
			);
			this.transformedEdges.push(
				new Vec3(this.transformedVertices[2])
					.subtract(this.transformedVertices[1])
					.normalize()
			);
			this.transformedEdges.push(
				new Vec3(this.transformedVertices[0])
					.subtract(this.transformedVertices[2])
					.normalize()
			);

			this.edgesNeedsUpdate = false;
		}
		return this.transformedEdges;
	}

	getTransformedEdgeNormals(): Array<Vec3> {
		if (this.edgeNormalsNeedsUpdate) {
			this.getTransformedEdges(); // Force update of edges
			this.getTransformedNormal(); // Force update of normal
			this.transformedEdgeNormals.length = 0;

			this.transformedEdgeNormals.push(
				new Vec3(this.transformedEdges[0])
					.cross(this.transformedNormal)
					.normalize()
			);
			this.transformedEdgeNormals.push(
				new Vec3(this.transformedEdges[1])
					.cross(this.transformedNormal)
					.normalize()
			);
			this.transformedEdgeNormals.push(
				new Vec3(this.transformedEdges[2])
					.cross(this.transformedNormal)
					.normalize()
			);

			this.edgeNormalsNeedsUpdate = false;
		}
		return this.transformedEdgeNormals;
	}
}
