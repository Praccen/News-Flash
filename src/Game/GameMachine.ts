import AudioPlayer from "../Engine/Audio/AudioPlayer.js";
import Input from "../Engine/Input/Input.js";
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
    }
}