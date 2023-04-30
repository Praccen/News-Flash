import System from "./System.js";
import { ComponentTypeEnum } from "../Components/Component.js";
import PositionComponent from "../Components/PositionComponent.js";

export default class PositionMatrixUpdateSystem extends System {
	constructor() {
		super([ComponentTypeEnum.POSITION]);
	}

	update(dt: number) {
		for (const e of this.entities) {
			// TODO: Add locic for position parent if that is ever needed. Or redo the whole position parent thing because it is not very nice to work with.

			let posComp = <PositionComponent>(
				e.getComponent(ComponentTypeEnum.POSITION)
			);

			posComp.matrix.setIdentity();
			posComp.calculateMatrix(posComp.matrix);
		}
	}
}
