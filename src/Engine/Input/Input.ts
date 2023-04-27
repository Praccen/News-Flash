import { windowInfo } from "../../main.js";
import TextObject2D from "../GUI/Text/TextObject2D.js";
import Vec2 from "../Maths/Vec2.js";

export default class Input {
	keys: boolean[];
	buttons: Map<string, boolean>;
	gamepads: Gamepad[];
	mousePosition: { x: number; y: number; previousX: number; previousY: number };
	mousePositionOnCanvas: {
		x: number;
		y: number;
		previousX: number;
		previousY: number;
	};
	mouseClicked: boolean;

	simulateTouchBasedOnMouse: boolean;

	touchUsed: boolean;
	joystickDirection: Vec2;
	repositionTouchControls: boolean;
	private joystickRadius: number;
	private screenAspectRatio: number;

	private joystickCenter: TextObject2D;
	private joystickBorder: TextObject2D;

	private buttonRadius: number;
	private aButton: TextObject2D;
	private bButton: TextObject2D;

	constructor() {
		this.keys = [];
		this.buttons = new Map();
		this.gamepads = new Array<Gamepad>();
		this.mousePosition = { x: 0, y: 0, previousX: 0, previousY: 0 };
		this.mousePositionOnCanvas = { x: 0, y: 0, previousX: 0, previousY: 0 };
		this.mouseClicked = false;

		this.simulateTouchBasedOnMouse = false;

		this.touchUsed = false;

		//----Controls----
		// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values <-- for key codes
		let self = this;
		document.addEventListener("keydown", function (event) {
			self.keys[event.key.toUpperCase()] = true;
			self.touchUsed = false;
		});

		document.addEventListener("keyup", function (event) {
			self.keys[event.key.toUpperCase()] = false;
			self.touchUsed = false;
		});

		document.addEventListener("mousemove", function (event) {
			self.mousePosition = {
				x: event.clientX,
				y: event.clientY,
				previousX: self.mousePosition.x,
				previousY: self.mousePosition.y,
			};
			self.mousePositionOnCanvas = {
				x: self.mousePosition.x - windowInfo.paddingX,
				y: self.mousePosition.y - windowInfo.paddingY,
				previousX: self.mousePositionOnCanvas.x,
				previousY: self.mousePositionOnCanvas.y,
			};
			if (self.simulateTouchBasedOnMouse && self.mouseClicked) {
				self.handleTouch([event]);
			}
		});

		document.addEventListener("mousedown", (event) => {
			self.mouseClicked = true;
			if (self.simulateTouchBasedOnMouse) {
				self.handleTouch([event]);
			}
		});
		document.addEventListener("mouseup", (event) => {
			self.mouseClicked = false;
			if (self.simulateTouchBasedOnMouse) {
				self.handleTouch([]);
			}
		});

		document.addEventListener("touchstart", function (event) {
			self.handleTouch(event.touches);
		});
		document.addEventListener("touchmove", function (event) {
			event.preventDefault();
			self.handleTouch(event.touches);
		});
		document.addEventListener("touchend", function (event) {
			self.handleTouch(event.touches);
		});
		//----------------

		this.joystickDirection = new Vec2();
		this.repositionTouchControls = false;
		this.joystickRadius = 0.1; // 10 % of the width
		this.screenAspectRatio = 16 / 9;

		this.joystickBorder = new TextObject2D();
		this.joystickBorder.center = true;
		this.joystickBorder.scaleWithWindow = true;
		this.joystickBorder.position = new Vec2([0.2, 0.8]);
		this.joystickBorder.size = 1920 * this.joystickRadius * 2.0;
		this.joystickBorder.textString = "⊕";
		this.joystickBorder.getElement().style.opacity = "50%";
		this.joystickBorder.setHidden(true);

		this.joystickCenter = new TextObject2D();
		this.joystickCenter.center = true;
		this.joystickCenter.scaleWithWindow = true;
		this.joystickCenter.position = new Vec2(this.joystickBorder.position);
		this.joystickCenter.size = 1920 * this.joystickRadius;
		this.joystickCenter.textString = "⚫";
		this.joystickCenter.getElement().style.opacity = "50%";
		this.joystickCenter.getElement().style.color = "red";
		this.joystickCenter.setHidden(true);

		this.buttonRadius = 0.05; // 5 % of the width

		this.aButton = new TextObject2D();
		this.aButton.center = true;
		this.aButton.scaleWithWindow = true;
		this.aButton.position.x = 0.8;
		this.aButton.position.y = 0.8;
		this.aButton.size = 1920 * this.buttonRadius * 2.0;
		this.aButton.textString = "🔴";
		this.aButton.getElement().style.opacity = "50%";
		this.aButton.setHidden(true);

		this.bButton = new TextObject2D();
		this.bButton.center = true;
		this.bButton.scaleWithWindow = true;
		this.bButton.position.x = 0.6;
		this.bButton.position.y = 0.8;
		this.bButton.size = 1920 * this.buttonRadius * 2.0;
		this.bButton.textString = "🔵";
		this.bButton.getElement().style.opacity = "50%";
		this.bButton.setHidden(true);
	}

	handleTouch(touches) {
		this.touchUsed = true;

		let joystickBeingUsed =
			this.joystickDirection.x != 0.0 || this.joystickDirection.y != 0.0;

		this.joystickDirection.x = 0.0;
		this.joystickDirection.y = 0.0;

		for (const key of this.buttons.keys()) {
			this.buttons.set(key, false);
		}

		var paddingX = windowInfo.paddingX;
		var paddingY = windowInfo.paddingY;
		let width = windowInfo.resolutionWidth;
		let height = windowInfo.resolutionHeight;

		let joystickRadiusInPixels = width * this.joystickRadius;
		let joystickCenter = new Vec2([
			paddingX + width * this.joystickBorder.position.x,
			paddingY + height * this.joystickBorder.position.y,
		]); // In pixels

		let aButtonCenter = new Vec2([
			paddingX + width * this.aButton.position.x,
			paddingY + height * this.aButton.position.y,
		]); // In pixels
		let bButtonCenter = new Vec2([
			paddingX + width * this.bButton.position.x,
			paddingY + height * this.bButton.position.y,
		]); // In pixels

		for (let touch of touches) {
			let touchPos = new Vec2([touch.clientX, touch.clientY]);

			// Handle touches not related to joystick here, break if they are fulfilled
			if (
				new Vec2(touchPos).subtract(aButtonCenter).len() <
				this.buttonRadius * width
			) {
				if (this.repositionTouchControls) {
					this.aButton.position.x = (touchPos.x - paddingX) / width;
					this.aButton.position.y = (touchPos.y - paddingY) / height;
				} else {
					this.buttons.set("A", true);
				}
				continue;
			}

			if (
				new Vec2(touchPos).subtract(bButtonCenter).len() <
				this.buttonRadius * width
			) {
				if (this.repositionTouchControls) {
					this.bButton.position.x = (touchPos.x - paddingX) / width;
					this.bButton.position.y = (touchPos.y - paddingY) / height;
				} else {
					this.buttons.set("B", true);
				}
				continue;
			}

			// Handle joystick
			let joystickDistanceFromCenter = new Vec2(touchPos).subtract(
				joystickCenter
			);
			// If the joystick was being used already, allow movement on the left size of the screen, otherwise allow movement within the joystick border
			if (
				(joystickBeingUsed ||
					joystickDistanceFromCenter.len() < joystickRadiusInPixels) &&
				touchPos.x < paddingX + width * 0.5
			) {
				if (this.repositionTouchControls) {
					this.joystickBorder.position.x = (touchPos.x - paddingX) / width;
					this.joystickBorder.position.y = (touchPos.y - paddingY) / height;
				} else {
					this.joystickDirection.x =
						joystickDistanceFromCenter.x / joystickRadiusInPixels;
					this.joystickDirection.y =
						joystickDistanceFromCenter.y / joystickRadiusInPixels;
				}
			}
		}
	}

	updateGamepad() {
		this.gamepads = navigator.getGamepads();

		for (const gp of this.gamepads) {
			if (!gp) {
				continue;
			}

			this.touchUsed = false;
			if (Math.abs(gp.axes[0]) > 0.1) {
				this.joystickDirection.x = gp.axes[0];
			} else {
				this.joystickDirection.x = 0.0;
			}

			if (Math.abs(gp.axes[1]) > 0.1) {
				this.joystickDirection.y = gp.axes[1];
			} else {
				this.joystickDirection.y = 0.0;
			}

			for (const key of this.buttons.keys()) {
				this.buttons.set(key, false);
			}

			if (gp.buttons[0].value > 0.5) {
				this.buttons.set("A", true);
				console.log("Pressed A");
			}
			if (gp.buttons[1].value > 0.5) {
				this.buttons.set("B", true);
				console.log("Pressed B");
			}
		}
	}

	drawTouchControls() {
		this.joystickBorder.setHidden(!this.touchUsed);
		this.joystickCenter.setHidden(!this.touchUsed);
		this.aButton.setHidden(!this.touchUsed);
		this.bButton.setHidden(!this.touchUsed);
		if (this.touchUsed) {
			this.joystickCenter.position.x =
				this.joystickBorder.position.x +
				this.joystickDirection.x * this.joystickRadius;
			this.joystickCenter.position.y =
				this.joystickBorder.position.y +
				this.joystickDirection.y *
					(this.joystickRadius * this.screenAspectRatio) -
				0.01;
			this.joystickBorder.draw();
			this.joystickCenter.draw();
			this.aButton.draw();
			this.bButton.draw();
		}
	}
}
