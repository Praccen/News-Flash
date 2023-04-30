import { ComponentTypeEnum } from "../../../Engine/ECS/Components/Component.js";
import PositionComponent from "../../../Engine/ECS/Components/PositionComponent.js";
import System from "../../../Engine/ECS/Systems/System.js";
import Game from "../../States/Game.js";
import DeiliveryZoneComponent from "../Components/DeliveryZoneComponent.js";

export default class DeliveryZoneSystem extends System {
	private game: Game;
	constructor() {
		super([ComponentTypeEnum.DELIVERYZONE]);
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
				if (!zoneComp.triggerd &&
					Math.pow(paperPosComp.position.x - zoneComp.pos.x, 2) +
					Math.pow(paperPosComp.position.y - zoneComp.pos.y, 2) +
					Math.pow(paperPosComp.position.z - zoneComp.pos.z, 2) <
					Math.pow(zoneComp.radius, 2)
				) {
					zoneComp.triggerd = true;
					this.game.score += 100;
					this.game.newspapersStopped.splice(i, 1);
					this.game.ecsManager.removeEntity(e.id);
					i--;
				}
			}
		}
	}
}
