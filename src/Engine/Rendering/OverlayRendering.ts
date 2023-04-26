import Camera from "../Camera.js";
import Button from "../GUI/Button.js";
import Checkbox from "../GUI/Checkbox.js";
import GuiObject from "../GUI/GuiObject.js";
import Progress from "../GUI/Progress.js";
import Slider from "../GUI/Slider.js";
import TextObject2D from "../GUI/Text/TextObject2D.js";
import TextObject3D from "../GUI/Text/TextObject3D.js";

export class OverlayRendering {
	private camera: Camera; // Optional camera for calculating 3D texts

	// ---- GUI rendering ----
	private guiObjects3D: Array<TextObject3D>;
	private guiObjects2D: Array<GuiObject>;
	// -----------------------

	constructor(camera: Camera = null) {
		this.camera = camera;

		// ---- GUI rendering ----
		this.guiObjects3D = new Array<TextObject3D>();
		this.guiObjects2D = new Array<GuiObject>();
		// -----------------------
	}

	clear() {
		for (let guiObject2D of this.guiObjects2D) {
			guiObject2D.remove();
		}

		for (let guiObject3D of this.guiObjects3D) {
			guiObject3D.remove();
		}
	}

	hide() {
		for (let guiObject2D of this.guiObjects2D) {
			guiObject2D.setHidden(true);
		}

		for (let guiObject3D of this.guiObjects3D) {
			guiObject3D.setHidden(true);
		}
	}

	show() {
		for (let guiObject2D of this.guiObjects2D) {
			guiObject2D.setHidden(false);
		}

		for (let guiObject3D of this.guiObjects3D) {
			guiObject3D.setHidden(false);
		}
	}

	getNew2DText(): TextObject2D {
		const length = this.guiObjects2D.push(new TextObject2D());
		return this.guiObjects2D[length - 1] as TextObject2D;
	}

	getNew3DText(): TextObject3D {
		const length = this.guiObjects3D.push(new TextObject3D());
		return this.guiObjects3D[length - 1];
	}

	getNewCheckbox(): Checkbox {
		const length = this.guiObjects2D.push(new Checkbox());
		return this.guiObjects2D[length - 1] as Checkbox;
	}

	getNewButton(): Button {
		const length = this.guiObjects2D.push(new Button());
		return this.guiObjects2D[length - 1] as Button;
	}

	getNewSlider(): Slider {
		const length = this.guiObjects2D.push(new Slider());
		return this.guiObjects2D[length - 1] as Slider;
	}

	getNewProgress(): Progress {
		const length = this.guiObjects2D.push(new Progress());
		return this.guiObjects2D[length - 1] as Progress;
	}

	draw() {
		// ---- GUI rendering ----
		if (this.camera != undefined) {
			for (let i = 0; i < this.guiObjects3D.length; i++) {
				if (!this.guiObjects3D[i].removed) {
					this.guiObjects3D[i].draw3D(this.camera.getViewProjMatrix());
				} else {
					this.guiObjects3D.splice(i, 1);
					i--;
				}
			}
		}

		for (let i = 0; i < this.guiObjects2D.length; i++) {
			if (!this.guiObjects2D[i].removed) {
				this.guiObjects2D[i].draw();
			} else {
				this.guiObjects2D.splice(i, 1);
				i--;
			}
		}
		// -----------------------
	}
}
