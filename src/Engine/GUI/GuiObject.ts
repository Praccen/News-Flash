import Vec2 from "../Maths/Vec2.js";

export default class GuiObject {
	protected position2D: Vec2;
	protected fontSize: number;
	scaleWithWindow: boolean;
	textString: string;
	center: boolean;

	private divContainerElement: HTMLElement;
	protected div: HTMLDivElement;

	constructor() {
		this.position2D = new Vec2();
		this.fontSize = 42;
		this.scaleWithWindow = true;
		this.textString = "";
		this.center = false;

		// look up the guicontainer
		this.divContainerElement = <HTMLElement>(
			document.getElementById("guicontainer")
		);

		// make the div
		this.div = document.createElement("div");

		// assign it a CSS class
		this.div.className = "floating-div";

		// add it to the divcontainer
		this.divContainerElement.appendChild(this.div);
	}

	getElement(): HTMLDivElement {
		return this.div;
	}

	protected drawObject() {
		let style = getComputedStyle(this.divContainerElement);
		this.div.style.left =
			parseInt(style.paddingLeft) +
			this.position2D.x * parseInt(style.width) +
			"px";
		this.div.style.top =
			parseInt(style.paddingTop) +
			this.position2D.y * parseInt(style.height) +
			"px";
		if (this.scaleWithWindow) {
			this.div.style.fontSize =
				this.fontSize * (parseInt(style.height) / 1080.0) + "px";
		} else {
			this.div.style.fontSize = this.fontSize + "px";
		}

		if (this.center) {
			this.div.style.transform = "translateX(-50%)";
		}
	}
}
