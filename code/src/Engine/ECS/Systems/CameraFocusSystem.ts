import System from "./System";
import { ComponentTypeEnum } from "../Components/Component";
import CameraFocusComponent from "../Components/CameraFocusCompontent";
import PositionComponent from "../Components/PositionComponent";
import Camera from "../../Camera";
import Vec3 from "../../Maths/Vec3";
import PositionParentComponent from "../Components/PositionParentComponent";

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
				posComp = <PositionComponent>e.getComponent(ComponentTypeEnum.POSITION);
			}

			let camFocusComp = <CameraFocusComponent>(
				e.getComponent(ComponentTypeEnum.CAMERAFOCUS)
			);

			let camPos = new Vec3(posComp.position);
			camPos.add(camFocusComp.offset);

			this.camera.setPosition(camPos.x, camPos.y, camPos.z);
			this.camera.setDir(
				-camFocusComp.offset.x,
				-camFocusComp.offset.y,
				-camFocusComp.offset.z
			);
		}
	}
}
