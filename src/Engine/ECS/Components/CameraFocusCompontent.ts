import Vec3 from "../../Maths/Vec3.js";
import { Component, ComponentTypeEnum } from "./Component.js";

export default class CameraFocusComponent extends Component {
	offset: Vec3;

	constructor() {
		super(ComponentTypeEnum.CAMERAFOCUS);
		this.offset = new Vec3();
	}
}
