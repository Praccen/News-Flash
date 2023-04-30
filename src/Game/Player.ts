import BoundingBoxComponent from "../Engine/ECS/Components/BoundingBoxComponent.js";
import CollisionComponent from "../Engine/ECS/Components/CollisionComponent.js";
import { ComponentTypeEnum } from "../Engine/ECS/Components/Component.js";
import MovementComponent from "../Engine/ECS/Components/MovementComponent.js";
import PositionComponent from "../Engine/ECS/Components/PositionComponent.js";
import ECSManager from "../Engine/ECS/ECSManager.js";
import Vec2 from "../Engine/Maths/Vec2.js";
import Vec3 from "../Engine/Maths/Vec3.js";
import Rendering from "../Engine/Rendering/Rendering.js";
import Scene from "../Engine/Rendering/Scene.js";
import DeliveryZone from "./DeliveryZone.js";
import { input } from "./GameMachine.js";
import Newspaper from "./Newspaper.js";

export default class Player {
	private scene: Scene;
	private rendering: Rendering;
	private ecsManager: ECSManager;

	private positionComp: PositionComponent;
	private movComp: MovementComponent;

	private throwCooldown: number;
	private throwTimer: number;
	private newspapers: Array<Newspaper>;
	private newspapersStopped: Array<Newspaper>;
	private deliveryZones: Array<DeliveryZone>;
	private rotation: Vec3;

	score: number;

	constructor(
		scene: Scene,
		rendering: Rendering,
		ecsManager: ECSManager,
		deliveryZones: Array<DeliveryZone>
	) {
		this.scene = scene;
		this.rendering = rendering;
		this.ecsManager = ecsManager;
		this.deliveryZones = deliveryZones;

		this.throwCooldown = 0.5;
		this.throwTimer = 0.0;
		this.newspapers = new Array<Newspaper>();
		this.newspapersStopped = new Array<Newspaper>();
		this.score = 0;
		this.rotation = new Vec3();
	}

	async init() {
		let entity = this.ecsManager.createEntity();
		this.positionComp = new PositionComponent();
		let boundingBoxComp = new BoundingBoxComponent();
		boundingBoxComp.boundingBox.setMinAndMaxVectors(
			new Vec3([-0.5, 0.0, -0.5]),
			new Vec3([0.5, 1.8, 0.5])
		);
		boundingBoxComp.updateTransformMatrix(this.positionComp.matrix);
		this.movComp = new MovementComponent();
		// this.movComp.velocity.z = 3.0;
		this.movComp.acceleration = 20.0;
		this.movComp.drag = 10.0;

		this.ecsManager.addComponent(entity, this.positionComp);
		this.ecsManager.addComponent(entity, boundingBoxComp);
		this.ecsManager.addComponent(entity, this.movComp);
		this.ecsManager.addComponent(entity, new CollisionComponent());

		this.respawn();
	}

	respawn() {
		this.positionComp.position.setValues(0.0, 0.0, 0.0);
		this.movComp.velocity.setValues(0.0, 0.0, 0.0);
		this.movComp.accelerationDirection.setValues(0.0, 0.0, 0.0);
	}

	getPosition(): Vec3 {
		return this.positionComp.position;
	}

	getVelocity(): Vec3 {
		return this.movComp.velocity;
	}

	throwPaper(dt: number, forward: Vec3) {
		if (this.throwTimer > this.throwCooldown) {
			this.throwTimer = 0.0;
			let pos = new Vec3(this.positionComp.position)
				.add(forward.multiply(1.0))
				.add([0.0, 1.4, 0.0]);
			// Add velocity to projectile and some extra uppwards velocity
			let vel = forward
				.multiply(10.0)
				.add(this.movComp.velocity)
				.add([0.0, 5.0, 0.0]);

			this.newspapers.push(
				new Newspaper(
					pos,
					vel,
					new Vec3(this.rotation),
					this.ecsManager,
					this.scene
				)
			);
		}
	}

	update(dt: number) {
		this.throwTimer += dt;

		for (let i = 0; i < this.newspapers.length; i++) {
			let paper = this.newspapers[i];
			// Newspaper is not moving so remove from array
			if (!paper.update(dt)) {
				this.newspapersStopped.push(this.newspapers[i]);
				this.newspapers.splice(i, 1);
				i--;
			}
		}

		// TODO Move this, and other newspaper, logic to game.ts
		for (let i = 0; i < this.deliveryZones.length; i++) {
			for (let j = 0; j < this.newspapersStopped.length; j++) {
				let posComp = <PositionComponent>(
					this.newspapersStopped[i].entity.getComponent(
						ComponentTypeEnum.POSITION
					)
				)
				if (this.deliveryZones[i].inZone(posComp.position)) {
					this.deliveryZones.splice(i, 1);
					i--;
					this.newspapersStopped.splice(j, 1);
					j--;
					this.score += 100;
				}
			}
		}

		// Update camera
		this.rendering.camera.setPosition(
			this.positionComp.position.x,
			this.positionComp.position.y + 1.7,
			this.positionComp.position.z
		);

		let rotVec: Vec2 = new Vec3([0.0, 0.0, 0.0]);
		let rotate = false;
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

		this.rotation.add([0.0, rotVec.y * 90.0 * dt, 0.0]);

		// Touch / joystick control
		input.updateGamepad();
		if (input.joystickRightDirection.length2() > 0.01) {
			rotVec = new Vec2([
				input.joystickRightDirection.y,
				input.joystickRightDirection.x,
			]).multiply(-210 * dt);
			rotate = true;
		}

		if (rotate) {
			let rotMatrix = new Matrix4(null);
			let rotAmount: number = 90.0;
			let rightVec: Vec3 = new Vec3(this.rendering.camera.getRight());
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
			let oldDir = new Vector3(this.rendering.camera.getDir());
			let newDir = rotMatrix.multiplyVector3(oldDir);
			this.rendering.camera.setDir(
				newDir.elements[0],
				Math.max(-0.65, Math.min(0.65, newDir.elements[1])),
				newDir.elements[2]
			);
		}

		let accVec = new Vec3();

		// Movement input
		let forward = new Vec3(this.rendering.camera.getDir());
		forward.y = 0.0;
		forward.normalize();

		let right = new Vec3(this.rendering.camera.getRight());
		right.y = 0.0;
		right.normalize();

		// Touch / joystick control
		input.updateGamepad();
		if (input.joystickLeftDirection.length2() > 0.001) {
			accVec.add(new Vec3(right).multiply(input.joystickLeftDirection.x * 2.0));
			accVec.subtract(
				new Vec3(forward).multiply(input.joystickLeftDirection.y * 2.0)
			);
		}
		// Keyboard control
		else {
			if (input.keys["W"]) {
				accVec.add(forward);
			}

			if (input.keys["S"]) {
				accVec.subtract(forward);
			}

			if (input.keys["A"]) {
				accVec.subtract(right);
			}

			if (input.keys["D"]) {
				accVec.add(right);
			}
		}

		if (accVec.length2() > 1.0) {
			accVec.normalize();
		}
		this.movComp.accelerationDirection.deepAssign(accVec);

		if (input.keys["E"] || input.buttons.get("B")) {
			this.throwPaper(dt, forward);
		}

		// Jumping
		if (input.keys[" "] || input.buttons.get("A")) {
			this.movComp.jumpRequested = true;
		} else {
			this.movComp.jumpRequested = false;
		}

		// Update drag based on velocity
		let xzVelocity = new Vec3(this.movComp.velocity);
		xzVelocity.y = 0.0;
		this.movComp.drag = 10.0 + xzVelocity.len();
	}
}
