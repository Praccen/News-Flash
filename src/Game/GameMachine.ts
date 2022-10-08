import AudioPlayer from "../Engine/Audio/AudioPlayer.js";
import TextObject2D from "../Engine/GUI/Text/TextObject2D.js";
import Input from "../Engine/Input/Input.js";
import Rendering from "../Engine/Rendering.js";
import { StatesEnum } from "../Engine/State.js";
import StateMachine from "../Engine/StateMachine.js";
import TextureStore from "../Engine/Textures/TextureStore.js";
import Game from "./Game.js";
import LoadingScreen from "./LoadingScreen.js";
import Menu from "./Menu.js";
import OptionsMenu from "./OptionsMenu.js";

// Globals 
export let input = new Input();
export let options = {
	useCrt: false,
	useBloom: true,
	showFps: true,
	volume: 0.05
};

/**
 * These are the variables available to all the states
 */
 export class StateAccessible {
    textureStore: TextureStore;
	// fpsDisplay: TextObject2D;
	audioPlayer: AudioPlayer;
}

export default class GameMachine extends StateMachine {
    stateAccessible: StateAccessible;

    private rendering: Rendering;
    private fpsDisplay: TextObject2D;

    constructor() {
        super(StatesEnum.LOADINGSCREEN);
        this.stateAccessible = {
            textureStore: new TextureStore(),
			// fpsDisplay: null,
			audioPlayer: new AudioPlayer()
		};

        // Add states
        this.addState(StatesEnum.LOADINGSCREEN, LoadingScreen, 1/60.0, new LoadingScreen(this.stateAccessible));
        this.addState(StatesEnum.MAINMENU, Menu, 1.0/60.0, new Menu(this.stateAccessible));
        this.addState(StatesEnum.OPTIONS, OptionsMenu, 1.0/60.0, new OptionsMenu(this.stateAccessible));
        this.addState(StatesEnum.GAME, Game, 1.0/144.0, new Game(this.stateAccessible));

        (<Game>(this.states.get(StatesEnum.GAME).state)).load();

        this.rendering = new Rendering(this.stateAccessible.textureStore);
        this.fpsDisplay = this.rendering.getNew2DText();
        this.fpsDisplay.position.x = 0.01;
		this.fpsDisplay.position.y = 0.01;
		this.fpsDisplay.size = 18;
		this.fpsDisplay.scaleWithWindow = false;
		this.fpsDisplay.getElement().style.color = "lime";
    }

    async runCurrentState() {
        this.fpsDisplay.setHidden(!options.showFps);
		this.fpsDisplay.textString = Math.round(this.fps) + "";
        this.rendering.draw();
        super.runCurrentState();
	}
}