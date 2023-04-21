import System from "./System.js";
import { ComponentTypeEnum } from "../Components/Component.js";
import CameraFocusComponent from "../Components/CameraFocusCompontent.js";
import PositionComponent from "../Components/PositionComponent.js";
import Camera from "../../Camera.js";
import Vec3 from "../../Maths/Vec3.js";
import PositionParentComponent from "../Components/PositionParentComponent.js";

export default class CameraFocusSystem extends System {
    camera: Camera;

	constructor(camera: Camera) {
		super([ComponentTypeEnum.POSITION, ComponentTypeEnum.CAMERAFOCUS]);
        this.camera = camera;
	}

	update(dt: number) {
		for (const e of this.entities) {

			let posComp = <PositionComponent>(
				e.getComponent(ComponentTypeEnum.POSITIONPARENT)
			);

            if (!posComp) {
                posComp = <PositionComponent>(e.getComponent(ComponentTypeEnum.POSITION));
            }

			let camFocusComp = <CameraFocusComponent>(
				e.getComponent(ComponentTypeEnum.CAMERAFOCUS)
			);

            let camPos = new Vec3(posComp.position);
            camPos.add(camFocusComp.offset);

			this.camera.setPosition(camPos.x, camPos.y, camPos.z);
            this.camera.setDir(-camFocusComp.offset.x, -camFocusComp.offset.y, -camFocusComp.offset.z);
		}
	}
}
