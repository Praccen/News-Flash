import Rendering from "../Engine/Rendering.js";
import Button from "../Engine/GUI/Button.js";
import Checkbox from "../Engine/GUI/Checkbox.js";
import TextObject2D from "../Engine/GUI/Text/TextObject2D.js";
import Slider from "../Engine/GUI/Slider.js";
import { options } from "./GameMachine.js";
import State, { StatesEnum } from "../Engine/State.js";
import { StateAccessible } from "./GameMachine.js";

export default class OptionsMenu extends State {
	private rendering: Rendering

	private backButton: Button;
	private crtCB: Checkbox;
	private bloomCB: Checkbox;
	private fpsDisplayCB: Checkbox;
	private fpsDisplay: TextObject2D;
	private volumeSlider: Slider;

	constructor(
			sa: StateAccessible
	) {
		super();
		this.rendering = new Rendering(sa.textureStore);
		
		this.crtCB = this.rendering.getNewCheckbox();
		// this.crtCB.center = true;
		this.crtCB.position.x = 0.4;
		this.crtCB.position.y = 0.3;
		this.crtCB.textSize = 50;
		this.crtCB.textString = "CRT-effect ";
		this.crtCB.getElement().style.color = "cyan";
		this.crtCB.getInputElement().style.accentColor = "red";
		this.crtCB.getInputElement().checked = options.useCrt;

		this.bloomCB = this.rendering.getNewCheckbox();
		// this.bloomCB.center = true;
		this.bloomCB.position.x = 0.4;
		this.bloomCB.position.y = 0.35;
		this.bloomCB.textSize = 50;
		this.bloomCB.textString = "Bloom-effect ";
		this.bloomCB.getElement().style.color = "cyan";
		this.bloomCB.getInputElement().style.accentColor = "red";
		this.bloomCB.getInputElement().checked = options.useBloom;

		this.fpsDisplayCB = this.rendering.getNewCheckbox();
		// this.fpsDisplayCB.center = true;
		this.fpsDisplayCB.position.x = 0.4;
		this.fpsDisplayCB.position.y = 0.4;
		this.fpsDisplayCB.textSize = 50;
		this.fpsDisplayCB.textString = "Fps counter ";
		this.fpsDisplayCB.getElement().style.color = "cyan";
		this.fpsDisplayCB.getInputElement().style.accentColor = "red";
		this.fpsDisplayCB.getInputElement().checked = options.showFps;

		this.volumeSlider = this.rendering.getNewSlider();
		// this.volumeSlider.center = true;
		this.volumeSlider.position.x = 0.4;
		this.volumeSlider.position.y = 0.45;
		this.volumeSlider.textSize = 50;
		this.volumeSlider.textString = "Volume ";
		this.volumeSlider.getElement().style.color = "cyan";
		this.volumeSlider.getInputElement().style.accentColor = "red";
		this.volumeSlider.getInputElement().min = "0";
		this.volumeSlider.getInputElement().max = "100";
		this.volumeSlider.getInputElement().value = options.volume * 1000 + "";

		this.backButton = this.rendering.getNewButton();
		this.backButton.position.x = 0.5;
		this.backButton.position.y = 0.6;
		this.backButton.center = true;
		this.backButton.textSize = 60;
		this.backButton.getInputElement().style.backgroundColor = "purple";
		this.backButton.getInputElement().style.color = "white";
		this.backButton.getInputElement().style.borderRadius = "4px";
		this.backButton.getInputElement().style.padding = "10px";
		this.backButton.textString = "Back to main menu";

		let self = this;
		this.backButton.onClick(function () {
			self.gotoState = StatesEnum.MAINMENU;
		});
	}

	async init() {
		super.init();
		this.rendering.show();
	}

	reset() {
		super.reset();
		this.rendering.hide();
	}

	update(dt: number) {
		options.useCrt = this.crtCB.getChecked();
		this.rendering.useCrt = options.useCrt;
		options.useBloom = this.bloomCB.getChecked();
		this.rendering.useBloom = options.useBloom;
		options.showFps = this.fpsDisplayCB.getChecked();
		// this.fpsDisplay.setHidden(!options.showFps);
		options.volume = this.volumeSlider.getValue() * 0.001;
	}

	draw() {
		this.rendering.draw();
	}
}
