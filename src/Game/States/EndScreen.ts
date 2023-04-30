import { OverlayRendering } from "../../Engine/Rendering/OverlayRendering";
import State from "../../Engine/State";
import { StateAccessible } from "../GameMachine";
import Game from "./Game";

export default class EndScreen extends State {
	private game: Game;
	private stateAccessible: StateAccessible;
	private overlayRendering: OverlayRendering;

	constructor(sa: StateAccessible, game: Game) {
		super();
		this.overlayRendering = new OverlayRendering();
		let endText = this.overlayRendering.getNew2DText();
		endText.position.x = 0.5;
		endText.position.y = 0.2;
		endText.center = true;
		endText.textString = "Game over!";
		endText.getElement().style.borderColor = "white";

		let scoreText = this.overlayRendering.getNew2DText();
		scoreText.position.x = 0.5;
		scoreText.position.y = 0.2;
		scoreText.center = true;
		scoreText.textString = "Game over!";
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
