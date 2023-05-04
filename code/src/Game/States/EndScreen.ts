import TextObject2D from "../../Engine/GUI/Text/TextObject2D";
import { OverlayRendering } from "../../Engine/Rendering/OverlayRendering";
import State, { StatesEnum } from "../../Engine/State";
import { StateAccessible } from "../GameMachine";
import Game from "./Game";

export default class EndScreen extends State {
	private game: Game;
	private overlayRendering: OverlayRendering;
	private endText: TextObject2D;
	private scoreText: TextObject2D;
	private scoreTextNumber: TextObject2D;

	constructor(sa: StateAccessible) {
		super();
		this.overlayRendering = new OverlayRendering();
		this.endText = this.overlayRendering.getNew2DText();
		this.endText.position.x = 0.5;
		this.endText.position.y = 0.2;
		this.endText.center = true;
		this.endText.textString = "Game End!";
		this.endText.getElement().style.borderColor = "white";

		this.scoreText = this.overlayRendering.getNew2DText();
		this.scoreText.position.x = 0.5;
		this.scoreText.position.y = 0.3;
		this.scoreText.center = true;
		this.scoreText.textString = "Completion time:";

		this.scoreTextNumber = this.overlayRendering.getNew2DText();
		this.scoreTextNumber.position.x = 0.5;
		this.scoreTextNumber.position.y = 0.35;
		this.scoreTextNumber.center = true;
		this.scoreTextNumber.textString = "0";

		let restartButton = this.overlayRendering.getNewButton();
		restartButton.position.x = 0.5;
		restartButton.position.y = 0.45;
		restartButton.center = true;
		restartButton.textString = "Restart";

		restartButton.onClick(function () {
			this.gotoState = StatesEnum.GAME;
			sa.restartGame = true;
		}.bind(this));
	}

	async init() {
		super.init();
		this.overlayRendering.show();
		this.game = Game.getInstanceNoSa();
		document.exitPointerLock();
	}

	reset() {
		super.reset();
		this.overlayRendering.hide();
	}

	update(dt: number) {}

	draw() {
		this.overlayRendering.draw();
		this.scoreTextNumber.textString = Math.floor(this.game.gameTimer).toString();
	}
}
