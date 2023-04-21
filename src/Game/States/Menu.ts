import { OverlayRendering } from "../../Engine/Rendering/OverlayRendering.js";
import Rendering from "../../Engine/Rendering/Rendering.js";
import State, { StatesEnum } from "../../Engine/State.js";
import { options, StateAccessible } from "../GameMachine.js";

export default class Menu extends State {
	// private rendering: Rendering
	private overlayRendering: OverlayRendering;

	constructor(
			sa: StateAccessible
	) {
		super();
		// this.rendering = new Rendering(sa.textureStore, sa.meshStore);
		this.overlayRendering = new OverlayRendering();

		let startButton = this.overlayRendering.getNewButton();
		startButton.position.x = 0.5;
		startButton.position.y = 0.3;
		startButton.center = true;
		startButton.textSize = 60;
		startButton.getInputElement().style.backgroundColor = "purple";
		startButton.getInputElement().style.color = "white";
		startButton.getInputElement().style.borderRadius = "4px";
		startButton.getInputElement().style.padding = "10px";
		startButton.textString = "Start";

		let self = this;
		startButton.onClick(function () {
			self.gotoState = StatesEnum.GAME;
			startButton.textString = "Resume";
		});

		let restartButton = this.overlayRendering.getNewButton();
		restartButton.position.x = 0.5;
		restartButton.position.y = 0.5;
		restartButton.center = true;
		restartButton.textSize = 60;
		restartButton.getInputElement().style.backgroundColor = "purple";
		restartButton.getInputElement().style.color = "white";
		restartButton.getInputElement().style.borderRadius = "4px";
		restartButton.getInputElement().style.padding = "10px";
		restartButton.textString = "Restart";

		restartButton.onClick(function () {
			self.gotoState = StatesEnum.GAME;
			sa.restartGame = true;
			startButton.textString = "Resume";
		});


		let optionsButton = this.overlayRendering.getNewButton();
		optionsButton.position.x = 0.5;
		optionsButton.position.y = 0.7;
		optionsButton.center = true;
		optionsButton.textSize = 60;
		optionsButton.getInputElement().style.backgroundColor = "purple";
		optionsButton.getInputElement().style.color = "white";
		optionsButton.getInputElement().style.borderRadius = "4px";
		optionsButton.getInputElement().style.padding = "10px";
		optionsButton.textString = "Options";

		optionsButton.onClick(function () {
			self.gotoState = StatesEnum.OPTIONS;
		});
	}

	async init() {
		super.init();
		this.overlayRendering.show();
	}

	reset() {
		super.reset();
		this.overlayRendering.hide();
	}

	update(dt: number) {
		
	}

	draw() {
		this.overlayRendering.draw();
	}
}
