import System from "./System.js";
import GraphicsComponent from "../Components/GraphicsComponent.js";
import { ComponentTypeEnum } from "../Components/Component.js";
import PositionComponent from "../Components/PositionComponent.js";
import PointLightComponent from "../Components/PointLightComponent.js";
import PositionParentComponent from "../Components/PositionParentComponent.js";

export default class GraphicsSystem extends System {
	constructor() {
		super([ComponentTypeEnum.POSITION]);
		// Optional ComponentTypeEnum.GRAPHICS, ComponentTypeEnum.POINTLIGHT, ComponentTypeEnun.POSITIONPARENT
	}

	update(dt: number) {
		for (const e of this.entities) {
			let posComp = <PositionComponent>(
				e.getComponent(ComponentTypeEnum.POSITION)
			);

			let graphComp = <GraphicsComponent>(
				e.getComponent(ComponentTypeEnum.GRAPHICS)
			);

			let posParentComp = <PositionParentComponent>(
				e.getComponent(ComponentTypeEnum.POSITIONPARENT)
			);

			if (graphComp && posComp) {
				graphComp.object.modelMatrix.setIdentity();

				if (posParentComp) {
					posParentComp.calculateMatrix(graphComp.object.modelMatrix);
					posParentComp.matrix.set(graphComp.object.modelMatrix);
				}

				posComp.calculateMatrix(graphComp.object.modelMatrix);
			}

			let pointLightComp = <PointLightComponent>(
				e.getComponent(ComponentTypeEnum.POINTLIGHT)
			);

			if (pointLightComp && posComp) {
				pointLightComp.pointLight.position
					.deepAssign(posComp.position)
					.add(pointLightComp.posOffset);

				if (posParentComp) {
					pointLightComp.pointLight.position.add(posParentComp.position);
				}
			}
		}
	}
}
