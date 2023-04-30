import { windowInfo } from "../../main";
import Vec2 from "../Maths/Vec2";

export default class GuiObject {
	protected position2D: Vec2;
	protected fontSize: number;
	scaleWithWindow: boolean;
	textString: string;
	center: boolean;

	removed: boolean;

	private divContainerElement: HTMLElement;
	protected div: HTMLDivElement;

	constructor(cssClass: string) {
		this.removed = false;
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
		this.div.className = cssClass;

		// add it to the divcontainer
		this.divContainerElement.appendChild(this.div);
	}

	getElement(): HTMLDivElement {
		return this.div;
	}

	setHidden(hidden: boolean) {
		this.div.hidden = hidden;
	}

	remove() {
		this.div.remove();
		this.removed = true;
	}

	protected drawObject() {
		this.div.style.left = this.position2D.x * 100 + "%";
		this.div.style.top = this.position2D.y * 100 + "%";
		if (this.scaleWithWindow) {
			this.div.style.fontSize =
				this.fontSize * (windowInfo.resolutionHeight / 1080.0) + "px";
		} else {
			this.div.style.fontSize = this.fontSize + "px";
		}

		if (this.center) {
			this.div.style.transform = "translate(-50%,-50%)";
		}
	}

	draw() {}
}
