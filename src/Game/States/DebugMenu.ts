import Button from "../../Engine/GUI/Button.js";
import { OverlayRendering } from "../../Engine/Rendering/OverlayRendering.js";
import { StateAccessible } from "../GameMachine.js";
import Game from "./Game.js";

export default class DebugMenu {
    private overlay: OverlayRendering;
    private stateAccessible: StateAccessible;
    private game: Game;
    
    private downloadOctreesButton: Button;
    private downloadTransformsButton: Button;

    constructor(stateAccessible: StateAccessible, game: Game) {
        this.overlay = new OverlayRendering();
        this.stateAccessible = stateAccessible;
        this.game = game;

        this.downloadOctreesButton = this.overlay.getNewButton();
		this.downloadOctreesButton.position.x = 0.8;
		this.downloadOctreesButton.position.y = 0.1;
		this.downloadOctreesButton.center = true;
		this.downloadOctreesButton.textSize = 40;
		this.downloadOctreesButton.getInputElement().style.backgroundColor = "purple";
		this.downloadOctreesButton.getInputElement().style.color = "white";
		this.downloadOctreesButton.getInputElement().style.borderRadius = "4px";
		this.downloadOctreesButton.getInputElement().style.padding = "10px";
		this.downloadOctreesButton.textString = "Download Octrees";

		let self = this;
		this.downloadOctreesButton.onClick(function () {
            self.stateAccessible.meshStore.downloadOctrees();
		});

        this.downloadTransformsButton = this.overlay.getNewButton();
		this.downloadTransformsButton.position.x = 0.6;
		this.downloadTransformsButton.position.y = 0.1;
		this.downloadTransformsButton.center = true;
		this.downloadTransformsButton.textSize = 40;
		this.downloadTransformsButton.getInputElement().style.backgroundColor = "purple";
		this.downloadTransformsButton.getInputElement().style.color = "white";
		this.downloadTransformsButton.getInputElement().style.borderRadius = "4px";
		this.downloadTransformsButton.getInputElement().style.padding = "10px";
		this.downloadTransformsButton.textString = "Download Transforms";

		this.downloadTransformsButton.onClick(function () {
            self.game.downloadTransforms();
		});
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