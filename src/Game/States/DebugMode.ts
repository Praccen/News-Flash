import State, { StatesEnum } from "../../Engine/State.js";
import { input, options, StateAccessible } from "../GameMachine.js";
import Game from "./Game.js";
import Vec2 from "../../Engine/Maths/Vec2.js";
import Vec3 from "../../Engine/Maths/Vec3.js";
import { MousePicking } from "../../Engine/Maths/MousePicking.js";
import DebugMenu from "./DebugMenu.js";

export default class DebugMode extends State {
	private game: Game;
	private stateAccessible: StateAccessible;
	private debugMenu: DebugMenu;
	private mouseWasPressed: boolean;

	constructor(sa: StateAccessible, game: Game) {
		super();
		this.stateAccessible = sa;
		this.game = game;
		this.debugMenu = new DebugMenu(this.stateAccessible, this.game);

		this.mouseWasPressed = false;
	}

	async init() {
		super.init();
		this.debugMenu.init();
	}

	reset() {
		super.reset();
		this.debugMenu.reset();
	}

	update(dt: number) {
		if (input.keys["P"]) {
			this.gotoState = StatesEnum.MAINMENU;
		}

		let moveVec: Vec3 = new Vec3();
		let move = false;
		if (input.keys["W"]) {
			moveVec.add(this.game.rendering.camera.getDir());
			move = true;
		}

		if (input.keys["S"]) {
			moveVec.subtract(this.game.rendering.camera.getDir());
			move = true;
		}

		if (input.keys["A"]) {
			moveVec.subtract(this.game.rendering.camera.getRight());
			move = true;
		}

		if (input.keys["D"]) {
			moveVec.add(this.game.rendering.camera.getRight());
			move = true;
		}

		if (input.keys[" "]) {
			moveVec.add(new Vec3([0.0, 1.0, 0.0]));
			move = true;
		}

		if (input.keys["SHIFT"]) {
			moveVec.subtract(new Vec3([0.0, 1.0, 0.0]));
			move = true;
		}

		if (move) {
			moveVec.normalize();
			moveVec.multiply(5.0 * dt); // Speed

			this.game.rendering.camera.translate(moveVec.x, moveVec.y, moveVec.z);
		}

		let rotVec: Vec2 = new Vec2([0.0, 0.0]);
		let rotate = false;

		// if (!input.keys["O"] && (input.mousePosition.x != input.mousePosition.previousX || input.mousePosition.y != input.mousePosition.previousY)) {
		// 	rotVec.setValues(
		// 		(input.mousePosition.previousY - input.mousePosition.y) * 0.2,
		// 		(input.mousePosition.previousX - input.mousePosition.x) * 0.2
		// 	);

		// 	rotate = true;

		// }

		if (input.keys["ARROWUP"]) {
			rotVec.x += 210 * dt;
			rotate = true;
		}

		if (input.keys["ARROWDOWN"]) {
			rotVec.x -= 210 * dt;
			rotate = true;
		}

		if (input.keys["ARROWLEFT"]) {
			rotVec.y += 210 * dt;
			rotate = true;
		}

		if (input.keys["ARROWRIGHT"]) {
			rotVec.y -= 210 * dt;
			rotate = true;
		}

		if (rotate) {
			let rotMatrix = new Matrix4(null);
			let rotAmount: number = 90.0;
			let rightVec: Vec3 = new Vec3(this.game.rendering.camera.getRight());
			if (rotVec.y) {
				rotMatrix.rotate(rotAmount * rotVec.y * dt, 0.0, 1.0, 0.0);
			}
			if (rotVec.x) {
				rotMatrix.rotate(
					rotAmount * rotVec.x * dt,
					rightVec.x,
					rightVec.y,
					rightVec.z
				);
			}
			let oldDir = new Vector3(this.game.rendering.camera.getDir());
			let newDir = rotMatrix.multiplyVector3(oldDir);
			this.game.rendering.camera.setDir(
				newDir.elements[0],
				newDir.elements[1],
				newDir.elements[2]
			);
		}

		if (input.mouseClicked) {
			if (!this.mouseWasPressed) {
				let ray = MousePicking.GetRay(this.game.rendering.camera);

				let dist = this.game.doRayCast(ray);

				if (dist >= 0.0) {
					this.game.placeTree(
						new Vec3(this.game.rendering.camera.getPosition()).add(
							new Vec3(ray.getDir()).multiply(dist)
						),
						0.1,
						new Vec3([0.0, Math.random() * 360, 0.0])
					);
				}
			}

			this.mouseWasPressed = true;
		} else {
			this.mouseWasPressed = false;
		}

		this.game.ecsManager.update(0.0);
	}

	prepareDraw(dt: number): void {}

	draw() {
		this.game.rendering.draw();
		this.debugMenu.draw();
		input.drawTouchControls();
	}
}
