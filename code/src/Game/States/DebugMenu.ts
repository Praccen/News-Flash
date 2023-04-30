import Button from "../../Engine/GUI/Button";
import TextObject2D from "../../Engine/GUI/Text/TextObject2D";
import { OverlayRendering } from "../../Engine/Rendering/OverlayRendering";
import { StateAccessible } from "../GameMachine";
import Game from "./Game";

export default class DebugMenu {
	private overlay: OverlayRendering;
	private stateAccessible: StateAccessible;
	private game: Game;

	private downloadOctreesButton: Button;
	private downloadTransformsButton: Button;

	placementMenuText: TextObject2D;

	constructor(stateAccessible: StateAccessible, game: Game) {
		this.overlay = new OverlayRendering();
		this.stateAccessible = stateAccessible;
		this.game = game;

		this.downloadOctreesButton = this.overlay.getNewButton();
		this.downloadOctreesButton.position.x = 0.8;
		this.downloadOctreesButton.position.y = 0.1;
		this.downloadOctreesButton.center = true;
		this.downloadOctreesButton.textSize = 40;
		this.downloadOctreesButton.getInputElement().style.backgroundColor =
			"purple";
		this.downloadOctreesButton.getInputElement().style.color = "white";
		this.downloadOctreesButton.getInputElement().style.borderRadius = "4px";
		this.downloadOctreesButton.getInputElement().style.padding = "10px";
		this.downloadOctreesButton.textString = "Download \nOctrees";

		let self = this;
		this.downloadOctreesButton.onClick(function () {
			self.stateAccessible.meshStore.downloadOctrees();
		});

		this.downloadTransformsButton = this.overlay.getNewButton();
		this.downloadTransformsButton.position.x = 0.6;
		this.downloadTransformsButton.position.y = 0.1;
		this.downloadTransformsButton.center = true;
		this.downloadTransformsButton.textSize = 40;
		this.downloadTransformsButton.getInputElement().style.backgroundColor =
			"purple";
		this.downloadTransformsButton.getInputElement().style.color = "white";
		this.downloadTransformsButton.getInputElement().style.borderRadius = "4px";
		this.downloadTransformsButton.getInputElement().style.padding = "10px";
		this.downloadTransformsButton.textString = "Download \nTransforms";

		this.downloadTransformsButton.onClick(function () {
			self.game.objectPlacer.downloadTransforms();
		});

		this.placementMenuText = this.overlay.getNew2DText();
		this.placementMenuText.position.x = 0.1;
		this.placementMenuText.position.y = 0.1;
		this.placementMenuText.center = true;
		this.placementMenuText.size = 20;
		this.placementMenuText.getElement().style.color = "white";
		this.placementMenuText.getElement().style.textShadow =
			"-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
	}

	async init() {
		this.overlay.show();
	}

	reset() {
		this.overlay.hide();
	}

	draw() {
		this.overlay.draw();
	}
}
