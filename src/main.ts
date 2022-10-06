import Input from "./Engine/Input/Input.js";
import Rendering from "./Engine/Rendering.js";
import ECSManager from "./Engine/ECS/ECSManager.js";
import AudioPlayer from "./Engine/Audio/AudioPlayer.js";
import { SAT } from "./Engine/Maths/SAT.js";
import Menu from "./Game/Menu.js";
import OptionsMenu from "./Game/OptionsMenu.js";
import Game from "./Game/Game.js";
import TextObject2D from "./Engine/GUI/Text/TextObject2D.js";
import StateMachine from "./Engine/StateMachine.js";

SAT.runUnitTests();

// Globals
export let gl: WebGL2RenderingContext;
export let input = new Input();
export let applicationStartTime = Date.now();
export let options = {
	useCrt: false,
	useBloom: true,
	showFps: true,
	volume: 0.05,
	resolutionWidth: 1920,
	resolutionHeight: 1080
};

function initWebGL(): WebGL2RenderingContext{
	canvas.width = options.resolutionWidth;
	canvas.height = options.resolutionHeight;

	let tempGl = canvas.getContext("webgl2", { antialias: false });
	if (!tempGl.getExtension("EXT_color_buffer_float")) {
		alert(
			"Rendering to floating point textures is not supported on this platform"
		);
	}
	if (!tempGl.getExtension("OES_texture_float_linear")) {
		alert("Floating point rendering to FBO textures not supported");
	}

	if (!tempGl) {
		console.log("Failed to get rendering context for WebGL");
		return;
	}

	return tempGl;
}

let heightByWidth = options.resolutionHeight / options.resolutionWidth;
let widthByHeight = options.resolutionWidth / options.resolutionHeight;
let canvas = <HTMLCanvasElement>document.getElementById("gameCanvas");
let guicontainer = <HTMLElement>document.getElementById("guicontainer");

function resize(gl: WebGL2RenderingContext, rendering: Rendering) {
	// Get the dimensions of the viewport
	let innerWindowSize = {
		width: window.innerWidth,
		height: window.innerHeight,
	};

	let newGameHeight;
	let newGameWidth;

	// Determine game size
	if (heightByWidth > innerWindowSize.height / innerWindowSize.width) {
		newGameHeight = innerWindowSize.height;
		newGameWidth = newGameHeight * widthByHeight;
	} else {
		newGameWidth = innerWindowSize.width;
		newGameHeight = newGameWidth * heightByWidth;
	}

	let newGameX = (innerWindowSize.width - newGameWidth) / 2;
	let newGameY = (innerWindowSize.height - newGameHeight) / 2;

	// Center the game by setting the padding of the game
	gl.canvas.style.padding = newGameY + "px " + newGameX + "px";
	guicontainer.style.padding = newGameY + "px " + newGameX + "px";

	// Resize game
	gl.canvas.style.width = newGameWidth + "px";
	gl.canvas.style.height = newGameHeight + "px";
	gl.canvas.width = newGameWidth;
	gl.canvas.height = newGameHeight;

	guicontainer.style.width = newGameWidth + "px";
	guicontainer.style.height = newGameHeight + "px";

	// Update the options resolution
	options.resolutionWidth = newGameWidth;
	options.resolutionHeight = newGameHeight;

	if (rendering) {
		rendering.reportCanvasResize(newGameWidth, newGameHeight);
	}
}

/**
 * These are the variables available to all the states
 */
export class StateAccessible {
	rendering: Rendering;
	fpsDisplay: TextObject2D;
	ecsManager: ECSManager;
	audioPlayer: AudioPlayer;
}

let stateMachine: StateMachine;

/* main */
window.onload = async () => {
	"use strict";

	// Set up webgl
	gl = initWebGL();

	// Init the state accessible variables
	let stateAccessible: StateAccessible = {
		rendering: null,
		fpsDisplay: null,
		ecsManager: null,
		audioPlayer: new AudioPlayer()
	};

	stateMachine = new StateMachine(stateAccessible);
	
	// Add states
	stateMachine.addState(Menu, 1.0/60.0);
	stateMachine.addState(OptionsMenu, 1.0/60.0);
	stateMachine.addState(Game, 1.0/144.0);

	stateMachine.resetStates();
	// Resize to fit the current window
	resize(gl, stateAccessible.rendering);

	// Resize canvas in the future when window is resized
	window.addEventListener("resize", function () {
		resize(gl, stateAccessible.rendering);
	});

	console.log("Everything is ready.");

	// Start the state machine
	stateMachine.start();
};
