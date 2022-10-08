import PointLight from "../../Lighting/PointLight.js";
import Vec3 from "../../Maths/Vec3.js";
import { Component, ComponentTypeEnum } from "./Component.js";

export default class PointLightComponent extends Component {
	pointLight: PointLight;
	posOffset: Vec3;

	constructor(pointLight: PointLight) {
		super(ComponentTypeEnum.POINTLIGHT);
		this.pointLight = pointLight;
		this.posOffset = new Vec3();
	}
}
