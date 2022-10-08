import { SAT } from "./Engine/Maths/SAT.js";
import GameMachine from "./Game/GameMachine.js";

SAT.runUnitTests();

// Globals
export let gl: WebGL2RenderingContext;
export let applicationStartTime = Date.now();
export let windowInfo =  {
	resolutionWidth: 1920,
	resolutionHeight: 1080
}

function initWebGL(): WebGL2RenderingContext{
	canvas.width = windowInfo.resolutionWidth;
	canvas.height = windowInfo.resolutionHeight;

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

let heightByWidth = windowInfo.resolutionHeight / windowInfo.resolutionWidth;
let widthByHeight = windowInfo.resolutionWidth / windowInfo.resolutionHeight;
let canvas = <HTMLCanvasElement>document.getElementById("gameCanvas");
let guicontainer = <HTMLElement>document.getElementById("guicontainer");

function resize(gl: WebGL2RenderingContext) {
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

	// Update the windowInfo resolution
	windowInfo.resolutionWidth = newGameWidth;
	windowInfo.resolutionHeight = newGameHeight;
}

let gameMachine: GameMachine;

/* main */
window.onload = async () => {
	"use strict";

	// Set up webgl
	gl = initWebGL();

	gameMachine = new GameMachine();

	// Resize to fit the current window
	resize(gl);

	// Resize canvas in the future when window is resized
	window.addEventListener("resize", function () {
		resize(gl);
	});

	console.log("Everything is ready.");

	// Start the state machine
	gameMachine.start();
};
