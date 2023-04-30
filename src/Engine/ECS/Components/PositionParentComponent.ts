import { ComponentTypeEnum } from "./Component.js";
import PositionComponent from "./PositionComponent.js";

export default class PositionParentComponent extends PositionComponent {
	constructor() {
		super(ComponentTypeEnum.POSITIONPARENT);
	}
}
