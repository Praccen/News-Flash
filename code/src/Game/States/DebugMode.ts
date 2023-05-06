import State, { StatesEnum } from "../../Engine/State";
import { input, options, StateAccessible } from "../GameMachine";
import Game from "./Game";
import Vec2 from "../../Engine/Maths/Vec2";
import Vec3 from "../../Engine/Maths/Vec3";
import { MousePicking } from "../../Engine/Maths/MousePicking";
import DebugMenu from "./DebugMenu";
import { WebUtils } from "../../Engine/Utils/WebUtils";

export default class DebugMode extends State {
	private game: Game;
	private stateAccessible: StateAccessible;
	private debugMenu: DebugMenu;
	private mouseWasPressed: boolean;
	private currentlyPlacing: number;
	private placementOptions: Array<string>;
	private lastMousePos: Vec2;

	constructor(sa: StateAccessible, game: Game) {
		super();
		this.stateAccessible = sa;
		this.game = game;
		this.debugMenu = new DebugMenu(this.stateAccessible, this.game);
		this.currentlyPlacing = 0;
		this.placementOptions = [
			"Assets/objs/mailbox.obj",
			"Assets/objs/house.obj",
			"Assets/objs/fence.obj",
			"Assets/objs/BigBuske.obj",
			"Assets/objs/SmolBuske.obj",
			"Assets/objs/DeliveryZone.obj",
			"Assets/objs/tree_1.obj",
			"Assets/objs/tree_2.obj",
			"Assets/objs/tree_3.obj",
		];

		let textString = "";
		for (let i = 0; i < this.placementOptions.length; i++) {
			textString += (i + 1) + ": " + this.placementOptions[i].split("/")[2] + " \r\n";
		}
		this.debugMenu.placementMenuText.textString = textString;

		this.lastMousePos = new Vec2([
			input.mousePosition.x,
			input.mousePosition.y,
		]);

		this.mouseWasPressed = false;
	}

	async init() {
		super.init();
		this.debugMenu.init();
		let posCookie = WebUtils.GetCookie("debugPos");
		if (posCookie != "") {
			let coords = posCookie.split(",");
			if (coords.length == 3) {
				this.game.rendering.camera.setPosition(parseFloat(coords[0]), parseFloat(coords[1]), parseFloat(coords[2]));
			}
		}

		let dirCookie = WebUtils.GetCookie("debugDir");
		if (dirCookie != "") {
			let coords = dirCookie.split(",");
			if (coords.length == 3) {
				this.game.rendering.camera.setDir(parseFloat(coords[0]), parseFloat(coords[1]), parseFloat(coords[2]));
			}
		}
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
			moveVec.multiply(15.0 * dt); // Speed

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

		this.currentlyPlacing = -1;
		for (let i = 1; i < this.placementOptions.length + 1; i++) {
			if (input.keys[i]) {
				this.currentlyPlacing = i - 1;
				break;
			}
		}

		if (input.mouseClicked) {
			// Holding mousebutton
			let rotChange = 0.0;
			let newPosition = null;
			let scaleChange = 0.0;
			let edited = false;
			if (input.keys["R"]) {
				rotChange = input.mousePosition.x - this.lastMousePos.x;
				edited = true;
				this.debugMenu.actionText.textString = "Rotating";
			}
			if (input.keys["T"]) {
				let ray = MousePicking.GetRay(this.game.rendering.camera);
				let dist = this.game.doRayCast(ray);

				if (dist >= 0.0) {
					newPosition = new Vec3(this.game.rendering.camera.getPosition()).add(
						new Vec3(ray.getDir()).multiply(dist));
					edited = true;
				}
				this.debugMenu.actionText.textString = "Moving";
			}
			if (input.keys["Y"]) {
				scaleChange =
				(this.lastMousePos.y - input.mousePosition.y) * 0.001;
				edited = true;
				this.debugMenu.actionText.textString = "Scaling";
			}

			if (edited) {
				this.game.objectPlacer.updateCurrentlyEditingObject(
					rotChange,
					scaleChange,
					newPosition
				);
			}
			else if (!this.mouseWasPressed) { // If we clicked the mouse button this frame
				let ray = MousePicking.GetRay(this.game.rendering.camera);
				if (this.currentlyPlacing >= 0) {
					// Place a new object
					let dist = this.game.doRayCast(ray);

					if (dist >= 0.0) {
						this.game.objectPlacer.placeObject(
							this.placementOptions[this.currentlyPlacing],
							new Vec3(this.game.rendering.camera.getPosition()).add(
								new Vec3(ray.getDir()).multiply(dist)
							),
							1.0,
							new Vec3([0.0, 0.0, 0.0])
						);
					}
					
					this.debugMenu.actionText.textString = "Placing new";
				}
				else { // Try to select a new object to edit
					this.game.objectPlacer.rayCastToSelectNewObject(ray);
					this.debugMenu.actionText.textString = "Picking";
				}
			}

			this.mouseWasPressed = true;
		} else {
			this.mouseWasPressed = false;
		}

		this.lastMousePos.deepAssign([
			input.mousePosition.x,
			input.mousePosition.y,
		]);
		this.game.ecsManager.update(0.0);

		let camPos = this.game.rendering.camera.getPosition();
		WebUtils.SetCookie("debugPos", camPos.x + "," + camPos.y + "," + camPos.z);
		let camDir = this.game.rendering.camera.getDir();
		WebUtils.SetCookie("debugDir", camDir.x + "," + camDir.y + "," + camDir.z);

		this.game.grassHandler.update(dt);
	}

	prepareDraw(dt: number): void {}

	draw() {
		this.game.rendering.draw();
		this.debugMenu.draw();
		input.drawTouchControls();
	}
}