import Rendering from "../Engine/Rendering.js";
import Button from "../Engine/GUI/Button.js";
import State, { StatesEnum } from "../Engine/State.js";
import { StateAccessible } from "./GameMachine.js";

export default class Menu extends State {
	private rendering: Rendering

	private startButton: Button;
	private optionsButton: Button;

	constructor(
			sa: StateAccessible
	) {
		super();
		this.rendering = new Rendering(sa.textureStore);

		this.startButton = this.rendering.getNewButton();
		this.startButton.position.x = 0.5;
		this.startButton.position.y = 0.46;
		this.startButton.center = true;
		this.startButton.textSize = 60;
		this.startButton.getInputElement().style.backgroundColor = "purple";
		this.startButton.getInputElement().style.color = "white";
		this.startButton.getInputElement().style.borderRadius = "4px";
		this.startButton.getInputElement().style.padding = "10px";
		this.startButton.textString = "Start";

		let self = this;
		this.startButton.onClick(function () {
			self.gotoState = StatesEnum.GAME;
		});

		this.optionsButton = this.rendering.getNewButton();
		this.optionsButton.position.x = 0.5;
		this.optionsButton.position.y = 0.6;
		this.optionsButton.center = true;
		this.optionsButton.textSize = 60;
		this.optionsButton.getInputElement().style.backgroundColor = "purple";
		this.optionsButton.getInputElement().style.color = "white";
		this.optionsButton.getInputElement().style.borderRadius = "4px";
		this.optionsButton.getInputElement().style.padding = "10px";
		this.optionsButton.textString = "Options";

		this.optionsButton.onClick(function () {
			self.gotoState = StatesEnum.OPTIONS;
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
		
	}

	draw() {
		this.rendering.draw();
	}
}
