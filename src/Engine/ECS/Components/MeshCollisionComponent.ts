import { Component, ComponentTypeEnum } from "./Component.js";
import Triangle3D from "../../Physics/Triangle3D.js";
import GraphicsObject from "../../Objects/GraphicsObject.js";

export default class MeshCollisionComponent extends Component {
	mesh: GraphicsObject;
	triangles: Array<Triangle3D>;
	isStatic: boolean;

	constructor(mesh: GraphicsObject) {
		super(ComponentTypeEnum.MESHCOLLISION);

		this.mesh = mesh;
		this.isStatic = false;

		this.triangles = new Array<Triangle3D>();
		mesh.setupShapes(this.triangles);
		this.updateTransformMatrix(mesh.modelMatrix);
	}

	updateTransformMatrix(matrix?: Matrix4) {
		if (matrix) {
			for (let tri of this.triangles) {
				tri.setTransformMatrix(matrix);
			}
		} else {
			for (let tri of this.triangles) {
				tri.setUpdateNeeded();
			}
		}
	}
}
