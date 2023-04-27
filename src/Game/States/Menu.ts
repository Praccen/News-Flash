import { OverlayRendering } from "../../Engine/Rendering/OverlayRendering.js";
import State, { StatesEnum } from "../../Engine/State.js";
import { StateAccessible } from "../GameMachine.js";

export default class Menu extends State {
	private overlayRendering: OverlayRendering;

	constructor(sa: StateAccessible) {
		super();
		this.overlayRendering = new OverlayRendering();

		let startButton = this.overlayRendering.getNewButton();
		startButton.position.x = 0.5;
		startButton.position.y = 0.3;
		startButton.center = true;
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

	update(dt: number) {}

	draw() {
		this.overlayRendering.draw();
	}
}
