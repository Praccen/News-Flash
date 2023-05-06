import AudioPlayer from "../Engine/Audio/AudioPlayer";
import TextObject2D from "../Engine/GUI/Text/TextObject2D";
import Input from "../Engine/Input/Input";
import MeshStore from "../Engine/AssetHandling/MeshStore";
import { StatesEnum } from "../Engine/State";
import StateMachine from "../Engine/StateMachine";
import TextureStore from "../Engine/AssetHandling/TextureStore";
import ControlsMenu from "./States/ControlsMenu";
import DebugMode from "./States/DebugMode";
import Game from "./States/Game";
import LoadingScreen from "./States/LoadingScreen";
import Menu from "./States/Menu";
import OptionsMenu from "./States/OptionsMenu";
import { WebUtils } from "../Engine/Utils/WebUtils";
import { OverlayRendering } from "../Engine/Rendering/OverlayRendering";
import EndScreen from "./States/EndScreen";

// Globals
export let input = new Input();
export let options = {
	useCrt: false,
	useBloom: false,
	foldableGrass: false,
	showFps: true,
	grassDensity: 10000,
	volume: 0.05,
};

/**
 * These are the variables available to all the states
 */
export class StateAccessible {
	textureStore: TextureStore;
	meshStore: MeshStore;
	// fpsDisplay: TextObject2D;
	audioPlayer: AudioPlayer;
	restartGame: boolean;
}

export default class GameMachine extends StateMachine {
	stateAccessible: StateAccessible;

	private overlayRendering: OverlayRendering;
	private fpsDisplay: TextObject2D;

	constructor() {
		super(StatesEnum.LOADINGSCREEN);
		this.initializeOptions();
		this.stateAccessible = {
			textureStore: new TextureStore(),
			meshStore: new MeshStore(),
			// fpsDisplay: null,
			audioPlayer: new AudioPlayer(),
			restartGame: false,
		};

		// Add states
		this.addState(
			StatesEnum.LOADINGSCREEN,
			LoadingScreen,
			1 / 60.0,
			new LoadingScreen(this.stateAccessible)
		);
		this.addState(
			StatesEnum.MAINMENU,
			Menu,
			1.0 / 60.0,
			new Menu(this.stateAccessible)
		);
		this.addState(
			StatesEnum.OPTIONS,
			OptionsMenu,
			1.0 / 60.0,
			new OptionsMenu(this.stateAccessible)
		);
		this.addState(
			StatesEnum.CONTROLS,
			ControlsMenu,
			1.0 / 60.0,
			new ControlsMenu(this.stateAccessible)
		);
		this.addState(
			StatesEnum.ENDSCREEN,
			EndScreen,
			1.0 / 60.0,
			new EndScreen(this.stateAccessible)
		);
		let game = Game.getInstance(this.stateAccessible);
		this.addState(StatesEnum.GAME, Game, 1.0 / 144.0, game);
		this.stateAccessible.restartGame = true;

		// game.load();
		this.addState(
			StatesEnum.DEBUGMODE,
			DebugMode,
			1.0 / 144.0,
			new DebugMode(this.stateAccessible, game)
		);

		this.overlayRendering = new OverlayRendering();
		this.fpsDisplay = this.overlayRendering.getNew2DText();
		this.fpsDisplay.position.x = 0.01;
		this.fpsDisplay.position.y = 0.01;
		this.fpsDisplay.size = 18;
		this.fpsDisplay.scaleWithWindow = false;
		this.fpsDisplay.getElement().style.color = "lime";
	}

	onExit(e: BeforeUnloadEvent) {
		WebUtils.SetCookie("showFps", options.showFps.valueOf().toString());
		WebUtils.SetCookie("useCrt", options.useCrt.valueOf().toString());
		WebUtils.SetCookie("useBloom", options.useBloom.valueOf().toString());
		WebUtils.SetCookie(
			"foldableGrass",
			options.foldableGrass.valueOf().toString()
		);
		WebUtils.SetCookie("volume", options.volume.toString());
		WebUtils.SetCookie("grassDensity", options.grassDensity.toString());

		for (let s of this.states) {
			s[1].state.onExit(e);
		}
	}

	initializeOptions() {
		options.showFps = !(WebUtils.GetCookie("showFps") == "false");
		options.useCrt = WebUtils.GetCookie("useCrt") == "true";
		options.useBloom = WebUtils.GetCookie("useBloom") == "true";
		options.foldableGrass = WebUtils.GetCookie("foldableGrass") == "true";
		let volumeCookie = WebUtils.GetCookie("volume");
		if (volumeCookie != "") {
			options.volume = parseFloat(volumeCookie);
		}
		let grassDensityCookie = WebUtils.GetCookie("grassDensity");
		if (grassDensityCookie != "") {
			options.grassDensity = parseFloat(grassDensityCookie);
		}
	}

	async runCurrentState() {
		this.fpsDisplay.setHidden(!options.showFps);
		this.fpsDisplay.textString = Math.round(this.fps) + "";
		this.overlayRendering.draw();
		super.runCurrentState();
	}
}