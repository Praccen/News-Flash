import Vec2 from "../../Maths/Vec2";
import Vec3 from "../../Maths/Vec3";
import GuiObject from "../GuiObject";

export default class TextObject2D extends GuiObject {
	position: Vec2;
	size: number;

	private textNode: Text;

	constructor() {
		super("floating-div");

		this.position = new Vec2();
		this.size = 42;

		// make a text node for its content
		this.textNode = document.createTextNode("");
		this.div.appendChild(this.textNode);
	}

	draw(): void {
		this.position2D = this.position;
		this.fontSize = this.size;
		this.textNode.textContent = this.textString;
		this.drawObject();
	}
}
