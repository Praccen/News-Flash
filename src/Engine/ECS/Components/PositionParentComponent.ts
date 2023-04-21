import { ComponentTypeEnum } from "./Component.js";
import PositionComponent from "./PositionComponent.js";

export default class PositionParentComponent extends PositionComponent {
	matrix: Matrix4;

	constructor() {
		super(ComponentTypeEnum.POSITIONPARENT);

		this.matrix = new Matrix4(null);
	}
}
