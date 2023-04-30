import {
	Component,
	ComponentTypeEnum,
} from "../../../Engine/ECS/Components/Component.js";
import Vec3 from "../../../Engine/Maths/Vec3.js";

export default class DeiliveryZoneComponent extends Component {
	pos: Vec3;
	radius: number;
	triggerd: boolean;

	constructor(componentType?: ComponentTypeEnum) {
		super(componentType ? componentType : ComponentTypeEnum.DELIVERYZONE);
		this.pos = new Vec3();
		this.radius = 0;
		this.triggerd = false;
	}
}
