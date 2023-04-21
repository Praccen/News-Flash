import GraphicsBundle from "../../Objects/GraphicsBundle.js";
import { Component, ComponentTypeEnum } from "./Component.js";

export default class GraphicsComponent extends Component {
	object: GraphicsBundle;

	constructor(object: GraphicsBundle) {
		super(ComponentTypeEnum.GRAPHICS);
		this.object = object;
	}
}
