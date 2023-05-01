import { ComponentTypeEnum } from "../../../Engine/ECS/Components/Component";
import GraphicsComponent from "../../../Engine/ECS/Components/GraphicsComponent";
import PositionComponent from "../../../Engine/ECS/Components/PositionComponent";
import System from "../../../Engine/ECS/Systems/System";
import Game from "../../States/Game";
import DeiliveryZoneComponent from "../Components/DeliveryZoneComponent";

export default class DeliveryZoneSystem extends System {
	private game: Game;
	constructor() {
		super([ComponentTypeEnum.DELIVERYZONE, ComponentTypeEnum.POSITION]);
		this.game = Game.getInstanceNoSa();
	}

	update(dt: number): void {
		for (const e of this.entities) {
			for (let i = 0; i < this.game.newspapersStopped.length; i++) {
				let paperPosComp = <PositionComponent>(
					this.game.newspapersStopped[i].entity.getComponent(
						ComponentTypeEnum.POSITION
					)
				);
				let zoneComp = (<DeiliveryZoneComponent>(e.getComponent(ComponentTypeEnum.DELIVERYZONE)));
				let posComp = (<PositionComponent>(e.getComponent(ComponentTypeEnum.POSITION)));
				let graComp = (<GraphicsComponent>(e.getComponent(ComponentTypeEnum.GRAPHICS)));

				zoneComp.pos.deepAssign(posComp.position);
				zoneComp.radius = posComp.scale.x;

				if (!zoneComp.triggerd &&
					Math.pow(paperPosComp.position.x - zoneComp.pos.x, 2) +
					Math.pow(paperPosComp.position.y - zoneComp.pos.y, 2) +
					Math.pow(paperPosComp.position.z - zoneComp.pos.z, 2) <
					Math.pow(zoneComp.radius, 2)
				) {
					zoneComp.triggerd = true;
					graComp.object.baseColor = new Vector3([0, 1, 0]);
					this.game.score += 100;
					this.game.newspapersStopped.splice(i, 1);
					this.game.ecsManager.removeEntity(e.id);
					i--;
				}
			}
		}
	}
}
