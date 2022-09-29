import { Component, ComponentTypeEnum } from "./Component.js";
import Triangle from "../../Physics/Shapes/Triangle.js";
import GraphicsObject from "../../Objects/GraphicsObject.js";

export default class MeshCollisionComponent extends Component {
	triangles: Array<Triangle>;

	constructor() {
		super(ComponentTypeEnum.MESHCOLLISION);
		this.triangles = new Array<Triangle>();
	}

	/**
	 * Sets up the triangles based on the vertices in a graphics object
	 * @param graphicsObj The graphics object
	 */
	setup(graphicsObj: GraphicsObject) {
		graphicsObj.setupTriangles(this.triangles);
	}

	/**
	 * Update the transform matrix used for the triangles.
	 * @param matrix Optional: Will set a new matrix to use for the triangles. If no matrix is sent, it will use the previously set matrix but mark all triangles to be updated.
	 */
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
