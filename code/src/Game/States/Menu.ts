import { OverlayRendering } from "../../Engine/Rendering/OverlayRendering";
import State, { StatesEnum } from "../../Engine/State";
import { WebUtils } from "../../Engine/Utils/WebUtils";
import { StateAccessible } from "../GameMachine";

export default class Menu extends State {
	private overlayRendering: OverlayRendering;

	constructor(sa: StateAccessible) {
		super();
		this.overlayRendering = new OverlayRendering();

		let startButton = this.overlayRendering.getNewButton();
		startButton.position.x = 0.5;
		startButton.position.y = 0.2;
		startButton.center = true;
		startButton.textString = "Start";

		let self = this;
		startButton.onClick(function () {
			self.gotoState = StatesEnum.GAME;
			startButton.textString = "Resume";
		});

		let restartButton = this.overlayRendering.getNewButton();
		restartButton.position.x = 0.5;
		restartButton.position.y = 0.4;
		restartButton.center = true;
		restartButton.textString = "Restart";

		restartButton.onClick(function () {
			self.gotoState = StatesEnum.GAME;
			sa.restartGame = true;
			startButton.textString = "Resume";
			WebUtils.SetCookie("debug", "false");
		});

		let optionsButton = this.overlayRendering.getNewButton();
		optionsButton.position.x = 0.5;
		optionsButton.position.y = 0.6;
		optionsButton.center = true;
		optionsButton.textString = "Options";

		optionsButton.onClick(function () {
			self.gotoState = StatesEnum.OPTIONS;
		});

		let fullscreenButton = this.overlayRendering.getNewButton();
		fullscreenButton.position.x = 0.5;
		fullscreenButton.position.y = 0.8;
		fullscreenButton.center = true;
		fullscreenButton.textString = "Fullscreen";

		fullscreenButton.onClick(function () {
			document.getElementById("gameDiv").requestFullscreen();
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
