import GuiObject from "./GuiObject.js";
import Vec2 from "../Maths/Vec2.js";

export default class Progress extends GuiObject {
	position: Vec2;
	size: number;

	private progressNode: HTMLProgressElement;

	constructor() {
		super("floating-div");

		this.position = new Vec2();
		this.size = 42;

		// make a text node for its content
		this.progressNode = document.createElement("progress");
		this.div.appendChild(this.progressNode);
	}

	getProgressElement(): HTMLProgressElement {
		return this.progressNode;
	}

	draw(): void {
		this.position2D = this.position;
		this.fontSize = this.size;
		this.progressNode.textContent = this.textString;
		this.drawObject();
	}
}
