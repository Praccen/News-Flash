import { Component, ComponentTypeEnum } from "./Component.js";
import Vec3 from "../../Maths/Vec3.js";

export default class PositionComponent extends Component {
	position: Vec3;
	rotation: Vec3;
	scale: Vec3;
	origin: Vec3;

	matrix: Matrix4;

	constructor(componentType?: ComponentTypeEnum) {
		super(componentType ? componentType : ComponentTypeEnum.POSITION);

		this.position = new Vec3();
		this.rotation = new Vec3();
		this.scale = new Vec3([1.0, 1.0, 1.0]);
		this.origin = new Vec3();

		this.matrix = new Matrix4(null);
	}

	calculateMatrix(matrix: Matrix4) {
		matrix.translate(this.position.x, this.position.y, this.position.z);
		if (this.rotation.length2() > 0.0000001) {
			let normRotation = new Vec3(this.rotation);
			normRotation.normalize();
			matrix.rotate(
				this.rotation.len(),
				normRotation.x,
				normRotation.y,
				normRotation.z
			);
		}
		matrix.scale(this.scale.x, this.scale.y, this.scale.z);
		matrix.translate(-this.origin.x, -this.origin.y, -this.origin.z);
	}
}
