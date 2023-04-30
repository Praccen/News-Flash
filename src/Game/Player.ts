import Camera from "../Engine/Camera.js";
import BoundingBoxComponent from "../Engine/ECS/Components/BoundingBoxComponent.js";
import CameraFocusComponent from "../Engine/ECS/Components/CameraFocusCompontent.js";
import CollisionComponent from "../Engine/ECS/Components/CollisionComponent.js";
import { ComponentTypeEnum } from "../Engine/ECS/Components/Component.js";
import GraphicsComponent from "../Engine/ECS/Components/GraphicsComponent.js";
import MovementComponent from "../Engine/ECS/Components/MovementComponent.js";
import PositionComponent from "../Engine/ECS/Components/PositionComponent.js";
import PositionParentComponent from "../Engine/ECS/Components/PositionParentComponent.js";
import ECSManager from "../Engine/ECS/ECSManager.js";
import Entity from "../Engine/ECS/Entity.js";
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

	private body: Entity;
	private legs: Array<Entity>;

	private groupPositionComp: PositionParentComponent;
	private movComp: MovementComponent;
	private camera: Camera;

	private lastAnimation: Function;
	private currentAnimation: Function;

	private offGroundTimer;

	private throwCooldown: number;
	private throwTimer: number;
	private newspapers: Array<Newspaper>;
	private newspapersStopped: Array<Newspaper>;
	private deliveryZones: Array<DeliveryZone>;

	private timer: number;
	private bodyMesh;
	score: number;

	constructor(scene: Scene, rendering: Rendering, ecsManager: ECSManager, deliveryZones: Array<DeliveryZone>) {
		this.scene = scene;
		this.rendering = rendering;
		this.ecsManager = ecsManager;
		this.deliveryZones = deliveryZones;


		this.legs = new Array<Entity>(4);

		this.timer = 0.0;
		this.lastAnimation = this.resetAnimation;
		this.currentAnimation = this.resetAnimation;
		this.offGroundTimer = 0.0;
		this.throwCooldown = 0.5;
		this.throwTimer = 0.0;
		this.newspapers = new Array<Newspaper>();
		this.newspapersStopped = new Array<Newspaper>();
		this.score = 0;
	}

	async init() {
		this.bodyMesh = await this.scene.getNewMesh(
			"Assets/objs/body.obj",
			"Assets/textures/medium_fur.png",
			"Assets/textures/black.png"
		);
		this.bodyMesh.textureMatrix.setScale(2.0, 10.0, 1.0);

		this.groupPositionComp = new PositionParentComponent();

		this.groupPositionComp.scale.setValues(0.25, 0.25, 0.25);

		this.body = this.ecsManager.createEntity();
		this.ecsManager.addComponent(
			this.body,
			new GraphicsComponent(this.bodyMesh)
		);
		this.ecsManager.addComponent(this.body, new PositionComponent());
		this.ecsManager.addComponent(this.body, this.groupPositionComp);

		let boundingBoxComp = new BoundingBoxComponent();
		boundingBoxComp.boundingBox.setMinAndMaxVectors(
			new Vec3([-0.75, -1.5, -2.0]),
			new Vec3([0.75, 0.2, 2.0])
		);
		// boundingBoxComp.boundingBox.setMinAndMaxVectors(new Vec3([-0.5, -1.5, -0.5]), new Vec3([0.5, -0.5, 0.5]));
		boundingBoxComp.updateTransformMatrix(this.groupPositionComp.matrix);
		this.ecsManager.addComponent(this.body, boundingBoxComp);
		this.ecsManager.addComponent(this.body, new CollisionComponent());
		this.movComp = new MovementComponent();
		// this.movComp.velocity.z = 3.0;
		this.movComp.acceleration = 20.0;
		this.movComp.drag = 10.0;
		this.ecsManager.addComponent(this.body, this.movComp);

		let counter = 0;
		for (let i = -1; i < 2; i += 2) {
			for (let j = -1; j < 2; j += 2) {
				this.legs[counter] = this.ecsManager.createEntity();

				if (j == -1) {
					let legMesh = await this.scene.getNewMesh(
						"Assets/objs/hind_leg.obj",
						"Assets/textures/medium_fur.png",
						"Assets/textures/black.png"
					);




					legMesh.textureMatrix.setScale(10.0, 2.0, 1.0);
					this.ecsManager.addComponent(
						this.legs[counter],
						new GraphicsComponent(legMesh)
					);
				} else {
					let legMesh = await this.scene.getNewMesh(
						"Assets/objs/front_leg.obj",
						"Assets/textures/medium_fur.png",
						"Assets/textures/black.png"
					);
					legMesh.textureMatrix.setScale(10.0, 2.0, 1.0);
					this.ecsManager.addComponent(
						this.legs[counter],
						new GraphicsComponent(legMesh)
					);
				}

				this.ecsManager.addComponent(
					this.legs[counter],
					new PositionComponent()
				);
				this.ecsManager.addComponent(
					this.legs[counter],
					this.groupPositionComp
				);
				counter++;
			}
		}

		this.respawn();
	}

	respawn() {
		this.groupPositionComp.position.setValues(0.0, -1.5, 0.0);
		this.rendering.camera.setPosition(this.groupPositionComp.position.x, this.groupPositionComp.position.y + 1.0, this.groupPositionComp.position.z)
		this.movComp.velocity.setValues(0.0, 0.0, 0.0);
	}

	getPosition(): Vec3 {
		return this.groupPositionComp.position;
	}

	getVelocity(): Vec3 {
		return this.movComp.velocity;
	}

	throwPaper(dt: number, forward: Vec3) {
		if (this.throwTimer > this.throwCooldown) {
			this.throwTimer = 0.0;
			let pos = new Vec3(this.groupPositionComp.position).add(
				forward.multiply(1.0)).add([0.0, 0.4, 0.0]);
			// Add velocity to projectile and some extra uppwards velocity
			let vel = forward.multiply(10.0).add(this.movComp.velocity).add([0.0, 5.0, 0.0]);
			this.newspapers.push(new Newspaper(pos, vel, this.groupPositionComp.rotation, this.ecsManager, this.scene));
		}
	}

	update(dt: number) {
		this.timer += dt;
		this.throwTimer += dt;

		let accVec = new Vec3();

		// Movement input
		let forward = new Vec3(this.rendering.camera.getDir());
		forward.y = 0.0;
		forward.normalize();

		let right = new Vec3(this.rendering.camera.getRight());
		right.y = 0.0;
		right.normalize();

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
				let posComp = <PositionComponent>this.newspapersStopped[i].entity.getComponent(ComponentTypeEnum.POSITION);
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
		this.rendering.camera.setPosition(this.groupPositionComp.position.x, this.groupPositionComp.position.y + 1.0, this.groupPositionComp.position.z)

		let rotVec: Vec2 = new Vec2([0.0, 0.0]);
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

		// Touch / joystick control
		input.updateGamepad();
		if (input.joystickRightDirection.length2() > 0.01) {
			rotVec = new Vec2([input.joystickRightDirection.y, input.joystickRightDirection.x]).normalize().multiply(-210 * dt);
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

		if (input.keys["E"] || input.buttons.get("B")) {
			this.throwPaper(dt, forward);
		}

		if (accVec.length2() > 0.001) {
			// Handle rotation of dog
			let targetRotation =
				90 - Math.atan2(accVec.z, accVec.x) * (180 / Math.PI);
			let diff = targetRotation - this.groupPositionComp.rotation.y;
			if (diff > 180) {
				diff -= 360;
			} else if (diff < -180) {
				diff += 360;
			}

			this.groupPositionComp.rotation.y =
				(this.groupPositionComp.rotation.y + diff * 0.04) % 360;

			let acceleration = accVec.len();

			this.movComp.accelerationDirection.x =
				Math.cos((90 - this.groupPositionComp.rotation.y) * (Math.PI / 180)) *
				Math.min(acceleration, 1.0);
			this.movComp.accelerationDirection.z =
				Math.sin((90 - this.groupPositionComp.rotation.y) * (Math.PI / 180)) *
				Math.min(acceleration, 1.0);

			// Walk/run animation based on velocity
			let vel = this.movComp.velocity.len();

			this.currentAnimation = this.walkAnimation;

			if (vel > 5.0) {
				this.currentAnimation = this.runAnimation;
			}
		} else {
			// No acceleration, stand still
			this.currentAnimation = this.resetAnimation;
		}

		// Jumping
		if (input.keys[" "] || input.buttons.get("A")) {
			this.movComp.jumpRequested = true;
			this.offGroundTimer = 0.5;
		} else {
			this.movComp.jumpRequested = false;
		}

		if (!this.movComp.onGround || this.movComp.jumpRequested) {
			this.offGroundTimer += dt;
			if (this.offGroundTimer >= 0.5) {
				this.currentAnimation = this.jumpAnimation;
			}
		} else {
			this.offGroundTimer = 0.0;
		}

		// Update rotation
		// let x = Math.cos(this.groupPositionComp.rotation.y * (Math.PI / 180));
		// let y = Math.sin(this.groupPositionComp.rotation.y * (Math.PI / 180));

		// this.groupPositionComp.rotation.x = x * this.movComp.velocity.y * 10.0;
		// this.groupPositionComp.rotation.z = y * this.movComp.velocity.y * 10.0;

		// Update drag based on velocity
		let xzVelocity = new Vec3(this.movComp.velocity);
		xzVelocity.y = 0.0;
		this.movComp.drag = 10.0 + xzVelocity.len();
		if (this.currentAnimation == this.sitAnimation) {
			this.movComp.drag *= 2.0;
		}

		// Reset animation timer if animation has changed since last frame
		if (this.currentAnimation != this.lastAnimation) {
			this.timer = 0.0;
		}
		this.currentAnimation();
		this.lastAnimation = this.currentAnimation;

		// let animations = [
		//     this.walkAnimation.bind(this),
		//     this.runAnimation.bind(this),
		//     this.sitAnimation.bind(this),
		//     this.jumpAnimation.bind(this)
		// ]

		// for (let i = 0; i < animations.length; i++) {
		//     if ((this.timer % (animations.length * 2.0)) < (i + 1) * 2.0) {
		//         animations[i]();
		//         break;
		//     }
		// }
	}

	private resetAnimation() {
		let counter = 0;
		for (let i = -1; i < 2; i += 2) {
			for (let j = -1; j < 2; j += 2) {
				let legPosComp = this.legs[counter].getComponent(
					ComponentTypeEnum.POSITION
				) as PositionComponent;
				if (legPosComp) {
					legPosComp.position.setValues(i * 0.55, -0.274, 0.15 + j * 1.15);
					legPosComp.scale.setValues(i, 1.0, 1.0);
					legPosComp.rotation.setValues(0.0, 0.0, 0.0);
				}
				counter++;
			}
		}

		let bodyPosComp = this.body.getComponent(
			ComponentTypeEnum.POSITION
		) as PositionComponent;
		if (bodyPosComp) {
			bodyPosComp.origin.setValues(0.0, 0.2, 0.9);
			bodyPosComp.position.setValues(0.0, 0.2, 0.9);
			bodyPosComp.rotation.setValues(0.0, 0.0, 0.0);
		}
	}

	private walkAnimation(animationSpeed: number = 7.5) {
		this.resetAnimation();

		let flip = [1.0, -1.0, -1.0, 1.0];

		for (let i = 0; i < this.legs.length; i++) {
			let posComp = this.legs[i].getComponent(
				ComponentTypeEnum.POSITION
			) as PositionComponent;
			if (posComp) {
				posComp.rotation.setValues(
					Math.sin(this.timer * animationSpeed) * 50.0 * flip[i],
					0.0,
					0.0
				);
			}
		}

		let bodyPosComp = this.body.getComponent(
			ComponentTypeEnum.POSITION
		) as PositionComponent;
		if (bodyPosComp) {
			bodyPosComp.rotation.setValues(
				Math.sin(this.timer * animationSpeed * 2.0) * 1.0,
				0.0,
				Math.sin(this.timer * animationSpeed) * 6.0
			);
		}
	}

	private runAnimation(animationSpeed: number = 12.0) {
		this.resetAnimation();

		let flip = [1.0, -1.0, 1.0, -1.0];

		for (let i = 0; i < this.legs.length; i++) {
			let posComp = this.legs[i].getComponent(
				ComponentTypeEnum.POSITION
			) as PositionComponent;
			if (posComp) {
				posComp.rotation.setValues(
					Math.sin(this.timer * animationSpeed + flip[i] * 0.7) *
					50.0 *
					flip[i],
					0.0,
					0.0
				);
			}
		}

		let bodyPosComp = this.body.getComponent(
			ComponentTypeEnum.POSITION
		) as PositionComponent;
		if (bodyPosComp) {
			bodyPosComp.rotation.setValues(
				Math.sin(this.timer * animationSpeed) * 3.0,
				0.0,
				Math.sin(this.timer * animationSpeed) * 5.0
			);
		}
	}

	private sitAnimation() {
		this.resetAnimation();

		let rotationX = [-80.0, -10.0, -80.0, -10.0];
		let moveY = [-0.9, -0.04, -0.9, -0.04];
		let moveZ = [0.0, 0.1, 0.0, 0.1];
		let flip = [-1.0, -1.0, 1.0, 1.0];

		for (let i = 0; i < this.legs.length; i++) {
			let posComp = this.legs[i].getComponent(
				ComponentTypeEnum.POSITION
			) as PositionComponent;
			if (posComp) {
				posComp.rotation.setValues(rotationX[i], flip[i] * 15.0, 0.0);
				posComp.position.y += moveY[i];
				posComp.position.z += moveZ[i];
				posComp.position.x -= flip[i] * 0.2;
			}
		}

		let bodyPosComp = this.body.getComponent(
			ComponentTypeEnum.POSITION
		) as PositionComponent;
		if (bodyPosComp) {
			bodyPosComp.rotation.setValues(-23.0, 0.0, 0.0);
		}
	}

	private jumpAnimation(animationSpeed: number = 1.0) {
		this.resetAnimation();

		let flip = [1.0, -1.0, 1.0, -1.0];

		for (let i = 0; i < this.legs.length; i++) {
			let posComp = this.legs[i].getComponent(
				ComponentTypeEnum.POSITION
			) as PositionComponent;
			if (posComp) {
				posComp.rotation.setValues(
					Math.sin((Math.min(this.timer, 1.4) + 1.1) * animationSpeed) *
					80.0 *
					flip[i],
					0.0,
					0.0
				);
			}
		}

		let bodyPosComp = this.body.getComponent(
			ComponentTypeEnum.POSITION
		) as PositionComponent;
		if (bodyPosComp) {
			bodyPosComp.rotation.setValues(
				Math.sin((Math.min(this.timer, 1.4) + 1.1) * animationSpeed) * 5.0,
				0.0,
				0.0
			);
		}
	}
}
