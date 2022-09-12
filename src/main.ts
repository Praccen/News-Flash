import Input from "./Engine/Input/Input.js";
import Rendering from "./Engine/Rendering.js";
import Game from "./Game/Game.js";
import ECSManager from "./Engine/ECS/ECSManager.js";
import AudioPlayer from "./Engine/Audio/AudioPlayer.js";
import { SAT } from "./Engine/Maths/SAT.js";

SAT.runUnitTests();

// Globals
export let canvas = <HTMLCanvasElement>document.getElementById("gameCanvas");
let guicontainer = <HTMLElement>document.getElementById("guicontainer");
export let input = new Input();
export let texturesRequestedVsLoaded = {
    req: 0,
    loaded: 0,
};
export let meshesRequestedVsLoaded = {
    req: 0,
    loaded: 0,
};
let heightByWidth = 1080/1920;
let widthByHeight = 1920/1080;

export let applicationStartTime = Date.now();

function initWebGL() {
	canvas.width = 1920;
	canvas.height = 1080;

	let gl = canvas.getContext("webgl2", {antialias: false});
    if (!gl.getExtension('EXT_color_buffer_float')) {
        alert('Rendering to floating point textures is not supported on this platform');
    }
    if (!gl.getExtension('OES_texture_float_linear')) {
        alert('Floating point rendering to FBO textures not supported');
    }

	if (!gl) {
		console.log("Failed to get rendering context for WebGL");
		return;
	}

	return gl;
}

function resize(gl: WebGL2RenderingContext, rendering: Rendering) {
	// Get the dimensions of the viewport
	let innerWindowSize = {
		width: window.innerWidth,
		height: window.innerHeight
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

    rendering.reportCanvasResize(newGameWidth, newGameHeight);
}

/* main */
window.onload = async () => {
	"use strict";

	let gl = initWebGL();

	let rendering = new Rendering(gl);
    let audio = new AudioPlayer();
	let ecsManager = new ECSManager(rendering, audio);
	let game = new Game(gl, rendering, ecsManager);

	let lastTick = null;

	// Fixed update rate
	let minUpdateRate = 1.0 / 120.0;
	let updateTimer = 0.0;
	let updatesSinceRender = 0;
    
    let fpsUpdateTimer = 0.0;
    let frameCounter = 0;

    let fpsDisplay = rendering.getNew2DText();
    fpsDisplay.position.x = 0.01;
    fpsDisplay.position.y = 0.01;
    fpsDisplay.size = 18;
    fpsDisplay.scaleWithWindow = false;
    fpsDisplay.getElement().style.color = "lime";


	/* Gameloop */
	function gameLoop() {
        let now = Date.now();
        let dt = (now - (lastTick || now)) * 0.001;
        lastTick = now;

        frameCounter++;
        fpsUpdateTimer += dt;

        if (fpsUpdateTimer > 0.5) {
            let fps = frameCounter / fpsUpdateTimer;
            fpsUpdateTimer -= 0.5;
            frameCounter = 0;
            fpsDisplay.textString = "" + Math.round(fps);
        }

        // Constant update rate
        updateTimer += dt;
        updatesSinceRender = 0;

        //Only update if update timer goes over update rate
        while (updateTimer >= minUpdateRate) {
            if (updatesSinceRender >= 20) {
                // Too many updates, throw away the rest of dt (makes the game run in slow-motion)
                updateTimer = 0;
                break;
            }

            game.update(minUpdateRate);
            ecsManager.update(minUpdateRate);
            updateTimer -= minUpdateRate;
            updatesSinceRender++;
        }

        if (updatesSinceRender == 0) {
            // dt is faster than min update rate, allow faster updates
            game.update(updateTimer);
            ecsManager.update(updateTimer);
            updateTimer = 0.0;
        }

        ecsManager.updateRenderingSystems(dt);
        rendering.draw();

        requestAnimationFrame(gameLoop);
    }

    window.addEventListener("resize", function () {
		resize(gl, rendering);
	});

    function waitForTextureLoading() { //Waits until all textures are loaded before starting the game
        if (texturesRequestedVsLoaded.loaded < texturesRequestedVsLoaded.req) {
            requestAnimationFrame(waitForTextureLoading);
        }
        else {
            console.log("All " + texturesRequestedVsLoaded.loaded + "/" + texturesRequestedVsLoaded.req + " textures loaded!");
        }
    }

    function waitForMeshLoading() { //Waits until all meshes are loaded before starting the game
        if (meshesRequestedVsLoaded.loaded < meshesRequestedVsLoaded.req) {
            requestAnimationFrame(waitForMeshLoading);
        }
        else {
            console.log("All " + meshesRequestedVsLoaded.loaded + "/" + meshesRequestedVsLoaded.req + " meshes loaded!");
        }
    }

	console.log("Everything is ready.");

	resize(gl, rendering);
	//requestAnimationFrame(waitForTextureLoading);
    //requestAnimationFrame(waitForMeshLoading);
    await game.init();
	requestAnimationFrame(gameLoop);
};