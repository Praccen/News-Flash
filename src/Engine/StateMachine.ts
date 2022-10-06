import { gl, options, StateAccessible } from "../main.js";
import ECSManager from "./ECS/ECSManager.js";
import Rendering from "./Rendering.js";
import State from "./State.js";

export default class StateMachine {
    states: Array<{stateType: any, minUpdateRate: number, state: State}>;
    private currentState: number;
    private stateAccessible: StateAccessible;
    private firstLoop: boolean;

	// Frame timer variables
    private lastTick = null;
	private updateTimer = 0.0;
	private fpsUpdateTimer = 0.0;
	private frameCounter = 0;
	private dt = 0.0;

    constructor(stateAccessible: StateAccessible) {
        this.states = new Array<{stateType: any, minUpdateRate: number, state: State}>();
        this.currentState = 0;
        this.stateAccessible = stateAccessible;
        this.firstLoop = true;
    }

    resetStates() {
        if (this.stateAccessible.rendering) {
			this.stateAccessible.rendering.clear();
		}
		this.stateAccessible.rendering = new Rendering(gl);
		if (this.stateAccessible.fpsDisplay) {
			this.stateAccessible.fpsDisplay.getElement().remove();
		}

		this.stateAccessible.audioPlayer.stopAll();
		this.stateAccessible.ecsManager = new ECSManager(this.stateAccessible.rendering);

		for (let state of this.states) {
			state.state = null;
		}
		this.firstLoop = true;

        this.stateAccessible.fpsDisplay = this.stateAccessible.rendering.getNew2DText();
        this.stateAccessible.fpsDisplay.position.x = 0.01;
        this.stateAccessible.fpsDisplay.position.y = 0.01;
        this.stateAccessible.fpsDisplay.size = 18;
        this.stateAccessible.fpsDisplay.scaleWithWindow = false;
        this.stateAccessible.fpsDisplay.getElement().style.color = "lime";
            
        this.stateAccessible.fpsDisplay.setHidden(!options.showFps)
    }

    addState(stateType: any, minUpdateRate: number) {
        this.states.push({stateType: stateType, minUpdateRate: minUpdateRate, state: null});
    }

    updateFrameTimers() {
		let now = Date.now();
		this.dt = (now - (this.lastTick || now)) * 0.001;
	    this.lastTick = now;

		this.frameCounter++;
		this.fpsUpdateTimer += this.dt;

		if (this.fpsUpdateTimer > 0.5) {
			let fps = this.frameCounter / this.fpsUpdateTimer;
			this.fpsUpdateTimer -= 0.5;
			this.frameCounter = 0;
			this.stateAccessible.fpsDisplay.textString = "" + Math.round(fps);
		}
	}

    updateState(state: State, minUpdateRate?: number) {
		this.updateFrameTimers();

		// Constant update rate
		this.updateTimer += this.dt;
		let updatesSinceRender = 0;

		if (minUpdateRate != undefined) {
			//Only update if update timer goes over update rate
			while (this.updateTimer >= minUpdateRate) {
				if (updatesSinceRender >= 20) {
					// Too many updates, throw away the rest of dt (makes the game run in slow-motion)
					this.updateTimer = 0;
					break;
				}

				state.update(minUpdateRate);
				this.stateAccessible.ecsManager.update(minUpdateRate);
				this.updateTimer -= minUpdateRate;
				updatesSinceRender++;
			}
		}
		
		if (updatesSinceRender == 0) {
			// dt is faster than min update rate, or no min update rate is set
			state.update(this.updateTimer);
			this.stateAccessible.ecsManager.update(this.updateTimer);
			this.updateTimer = 0.0;
		}

		this.stateAccessible.ecsManager.updateRenderingSystems(this.dt);

		if (!this.firstLoop) {
			this.stateAccessible.rendering.draw();
		}

		this.firstLoop = false;
	}

    async runCurrentState() {
		if (this.currentState >= 0 || this.currentState < this.states.length) {	// Check that the current state is valid

            // Create the state if it is not defined
			if (!this.states[this.currentState].state) {
				this.states[this.currentState].state = new this.states[this.currentState].stateType(this.stateAccessible) as State;
				await this.states[this.currentState].state.init();
			}

            // Update the state
			this.updateState(this.states[this.currentState].state, this.states[this.currentState].minUpdateRate);

            // Check if we should change state
			if (this.states[this.currentState].state.gotoState != -1) {
				this.currentState = this.states[this.currentState].state.gotoState;
                // Reset all states
				this.resetStates();

                // TODO: Add different ways to switch states, like for example, maybe we want to just have a state overlayed on top of another (pause menu). 
                // Or we want to show a new state but keep the old one intact so we can move back to it at resume (this would require multiple render states as well)
			}

			requestAnimationFrame(this.runCurrentState.bind(this));
		}
	}

    start() {
        requestAnimationFrame(this.runCurrentState.bind(this));
    }
}