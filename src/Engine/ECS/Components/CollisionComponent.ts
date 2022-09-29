import { Component, ComponentTypeEnum } from "./Component.js";

export default class CollisionComponent extends Component {
	isStatic: boolean;

	constructor() {
		super(ComponentTypeEnum.COLLISION);
		this.isStatic = false;
	}
}
