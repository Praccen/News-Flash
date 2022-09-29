import GraphicsObject from "../../Objects/GraphicsObject.js";
import { Component, ComponentTypeEnum } from "./Component.js";

export default class GraphicsComponent extends Component {
	object: GraphicsObject;

	constructor(object: GraphicsObject) {
		super(ComponentTypeEnum.GRAPHICS);
		this.object = object;
	}
}
