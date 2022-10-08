import ECSManager from "../Engine/ECS/ECSManager.js";
import Entity from "../Engine/ECS/Entity.js";
import ParticleSpawnerComponent from "../Engine/ECS/Components/ParticleSpawnerComponent.js";
import GraphicsComponent from "../Engine/ECS/Components/GraphicsComponent.js";
import PositionComponent from "../Engine/ECS/Components/PositionComponent.js";
import MovementComponent from "../Engine/ECS/Components/MovementComponent.js";
import { ComponentTypeEnum } from "../Engine/ECS/Components/Component.js";
import TextObject3D from "../Engine/GUI/Text/TextObject3D.js";
import Vec2 from "../Engine/Maths/Vec2.js";
import Vec3 from "../Engine/Maths/Vec3.js";
import PointLight from "../Engine/Lighting/PointLight.js";
import CollisionComponent from "../Engine/ECS/Components/CollisionComponent.js";
import BoundingBoxComponent from "../Engine/ECS/Components/BoundingBoxComponent.js";
import MeshCollisionComponent from "../Engine/ECS/Components/MeshCollisionComponent.js";
import State, { StatesEnum } from "../Engine/State.js";
import Rendering from "../Engine/Rendering.js";
import { input, StateAccessible } from "./GameMachine.js";

export default class Game extends State {
	private rendering: Rendering;
	private ecsManager: ECSManager;

	private particleText: TextObject3D;
	private particleSpawner: Entity;

	private boxEntity: Entity;
	private knightEntity: Entity;

	constructor(
			sa: StateAccessible
	) {
		super();
		this.rendering = new Rendering();

		this.ecsManager = new ECSManager(this.rendering);

		// Textures
		let smileyTexture =
			"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png";
		let floorTexture =
			"https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/371b6fdf-69a3-4fa2-9ff0-bd04d50f4b98/de8synv-6aad06ab-ed16-47fd-8898-d21028c571c4.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzM3MWI2ZmRmLTY5YTMtNGZhMi05ZmYwLWJkMDRkNTBmNGI5OFwvZGU4c3ludi02YWFkMDZhYi1lZDE2LTQ3ZmQtODg5OC1kMjEwMjhjNTcxYzQucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.wa-oSVpeXEpWqfc_bexczFs33hDFvEGGAQD969J7Ugw";
		let fireTexture = "Assets/textures/fire.png";

		this.createFloorEntity(floorTexture);

		for (let i = 0; i < 5; i++) {
			this.createTestEntity(
				new Vec3({ x: -1.25 + i * 0.5, y: 0.0, z: -2.0 }),
				-10.0 * i
			);
		}

		this.createPointLight(
			new Vec3({ x: 0.0, y: 0.2, z: 0.0 }),
			new Vec3({ x: 0.7, y: 0.0, z: 0.0 })
		);
		this.createPointLight(
			new Vec3({ x: 4.0, y: 0.2, z: 2.0 }),
			new Vec3({ x: 0.7, y: 0.0, z: 1.0 })
		);

		let particleSpawnerPos = new Vec3({ x: -2.0, y: 1.0, z: 0.0 });
		this.particleSpawner = this.createParticleSpawner(
			particleSpawnerPos,
			10000,
			1.3,
			fireTexture
		);

		this.rendering.camera.setPosition(0.0, 0.0, 5.5);

		this.rendering.getNewQuad(smileyTexture);

		this.particleText = this.rendering.getNew3DText();
		this.particleText.textString = "This is a fire fountain";
		this.particleText.getElement().style.color = "lime";
		this.particleText.size = 100;
		this.particleText.position = particleSpawnerPos;
		this.particleText.center = true;
	}

	async load() {
		// ---- Box ----
		let boxTexture =
			"https://as2.ftcdn.net/v2/jpg/01/99/14/99/1000_F_199149981_RG8gciij11WKAQ5nKi35Xx0ovesLCRaU.jpg";
		let boxMesh = await this.rendering.getNewMesh(
			"Assets/objs/cube.obj",
			boxTexture,
			boxTexture
		);
		this.boxEntity = this.ecsManager.createEntity();

		this.ecsManager.addComponent(
			this.boxEntity,
			new GraphicsComponent(boxMesh)
		);
		let boxPosComp = new PositionComponent();
		this.ecsManager.addComponent(this.boxEntity, new MovementComponent());
		boxPosComp.position.setValues(-4.0, 0.0, 0.0);
		boxPosComp.rotation.setValues(0.0, 45.0, 0.0);
		boxPosComp.scale.setValues(0.2, 0.2, 0.2);
		this.ecsManager.addComponent(this.boxEntity, boxPosComp);

		// Collision stuff
		let boxBoundingBoxComp = new BoundingBoxComponent();
		boxBoundingBoxComp.setup(boxMesh);
		boxBoundingBoxComp.updateTransformMatrix(boxMesh.modelMatrix);
		this.ecsManager.addComponent(this.boxEntity, boxBoundingBoxComp);
		this.ecsManager.addComponent(this.boxEntity, new CollisionComponent());
		// -------------

		// ---- Knight ----
		let knightTexture = "Assets/textures/knight.png";
		let knightMesh = await this.rendering.getNewMesh(
			"Assets/objs/knight.obj",
			knightTexture,
			knightTexture
		);
		this.knightEntity = this.ecsManager.createEntity();
		this.ecsManager.addComponent(
			this.knightEntity,
			new GraphicsComponent(knightMesh)
		);
		let knightPosComp = new PositionComponent();
		knightPosComp.position.setValues(2.0, -2.0, 0.0);
		knightPosComp.rotation.setValues(0.0, -45.0, 0.0);
		knightPosComp.scale.setValues(0.25, 0.25, 0.25);
		this.ecsManager.addComponent(this.knightEntity, knightPosComp);

		// Collision stuff
		let knightBoundingBoxComp = new BoundingBoxComponent();
		knightBoundingBoxComp.setup(knightMesh);
		knightBoundingBoxComp.updateTransformMatrix(knightMesh.modelMatrix);
		this.ecsManager.addComponent(this.knightEntity, knightBoundingBoxComp);
		let knightColComp = new CollisionComponent();
		knightColComp.isStatic = true;
		this.ecsManager.addComponent(this.knightEntity, knightColComp);
		let knightMeshCollisionComp = new MeshCollisionComponent();
		knightMeshCollisionComp.setup(knightMesh);
		knightMeshCollisionComp.updateTransformMatrix(knightMesh.modelMatrix);
		this.ecsManager.addComponent(this.knightEntity, knightMeshCollisionComp);
		// ----------------
	}

	async init() {
		super.init();
		this.rendering.show();
	}

	reset() {
		super.reset();
		this.rendering.hide();
	}

	createFloorEntity(texturePath: string) {
		let entity = this.ecsManager.createEntity();
		let phongQuad = this.rendering.getNewPhongQuad(texturePath, texturePath);
		phongQuad.textureMatrix.setScale(50.0, 50.0, 1.0);
		this.ecsManager.addComponent(entity, new GraphicsComponent(phongQuad));
		let posComp = new PositionComponent(new Vec3({ x: 0.0, y: -2.0, z: 0.0 }));
		posComp.rotation.setValues(-90.0, 0.0, 0.0);
		posComp.scale.setValues(50.0, 50.0, 1.0);
		this.ecsManager.addComponent(entity, posComp);

		// Collision stuff
		let boundingBoxComp = new BoundingBoxComponent();
		boundingBoxComp.setup(phongQuad);
		boundingBoxComp.updateTransformMatrix(phongQuad.modelMatrix);
		this.ecsManager.addComponent(entity, boundingBoxComp);
		let collisionComp = new CollisionComponent();
		collisionComp.isStatic = true;
		this.ecsManager.addComponent(entity, collisionComp);
	}

	createTestEntity(pos: Vec3, rotX: number = 0.0) {
		let entity = this.ecsManager.createEntity();
		let smileyPath =
			"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png";
		this.ecsManager.addComponent(
			entity,
			new GraphicsComponent(
				this.rendering.getNewPhongQuad(smileyPath, smileyPath)
			)
		);
		let posComp = new PositionComponent(pos);
		posComp.rotation.setValues(rotX, 0.0, 0.0);
		this.ecsManager.addComponent(entity, posComp);

		// let ac = new AnimationComponent();
		// ac.spriteMap.setNrOfSprites(2, 1);
		// ac.startingTile = {x: 0, y: 0};
		// ac.advanceBy = {x: 1.0, y: 0.0};
		// ac.modAdvancement = {x: 2.0, y: 1.0};
		// ac.updateInterval = 0.5;
		// this.ecsManager.addComponent(entity, ac);

		return entity;
	}

	createPointLight(position: Vec3, colour: Vec3): PointLight {
		let pl = this.rendering.getNewPointLight();
		pl.position = position;
		pl.colour = colour;

		return pl;
	}

	createParticleSpawner(
		position: Vec3,
		numParticles: number,
		lifeTime: number,
		texturePath: string
	): Entity {
		let particleSpawner = this.rendering.getNewParticleSpawner(
			texturePath,
			numParticles
		);
		particleSpawner.fadePerSecond = 1.0 / lifeTime;
		particleSpawner.sizeChangePerSecond = -0.4 * (1.0 / lifeTime);

		for (let i = 0; i < particleSpawner.getNumberOfParticles(); i++) {
			let rand = Math.random() * 2.0 * Math.PI;

			particleSpawner.setParticleData(
				i,
				new Vec3(position),
				0.4,
				new Vec3({
					x: Math.cos(rand),
					y: 5.0 + Math.random() * 20.0,
					z: Math.sin(rand),
				})
					.normalize()
					.multiply(8.0 + Math.random() * 3.0),
				new Vec3({ x: 0.0, y: -4.0, z: 0.0 })
			);
		}

		let entity = this.ecsManager.createEntity();
		this.ecsManager.addComponent(entity, new PositionComponent(position));
		let movComp = new MovementComponent();
		movComp.velocity.z = 5.0;
		movComp.constantAcceleration.multiply(0.0);
		this.ecsManager.addComponent(entity, movComp);
		let particleComp = new ParticleSpawnerComponent(particleSpawner);
		particleComp.lifeTime = lifeTime;
		this.ecsManager.addComponent(entity, particleComp);
		return entity;
	}

	update(dt: number) {
		let moveVec: Vec3 = new Vec3();
		let move = false;
		if (input.keys["w"] || input.keys["W"]) {
			moveVec.add(this.rendering.camera.getDir());
			move = true;
		}

		if (input.keys["s"] || input.keys["S"]) {
			moveVec.subtract(this.rendering.camera.getDir());
			move = true;
		}

		if (input.keys["a"] || input.keys["A"]) {
			moveVec.subtract(this.rendering.camera.getRight());
			move = true;
		}

		if (input.keys["d"] || input.keys["D"]) {
			moveVec.add(this.rendering.camera.getRight());
			move = true;
		}

		if (input.keys[" "]) {
			moveVec.add(new Vec3({ x: 0.0, y: 1.0, z: 0.0 }));
			move = true;
		}

		if (input.keys["Shift"]) {
			moveVec.subtract(new Vec3({ x: 0.0, y: 1.0, z: 0.0 }));
			move = true;
		}

		if (move) {
			moveVec.normalize();
			moveVec.multiply(5.0 * dt); // Speed

			this.rendering.camera.translate(moveVec.x, moveVec.y, moveVec.z);
		}

		let rotVec: Vec2 = new Vec2({ x: 0.0, y: 0.0 });
		let rotate = false;
		if (input.keys["ArrowUp"]) {
			rotVec.x += 1.0;
			rotate = true;
		}

		if (input.keys["ArrowDown"]) {
			rotVec.x -= 1.0;
			rotate = true;
		}

		if (input.keys["ArrowLeft"]) {
			rotVec.y += 1.0;
			rotate = true;
		}

		if (input.keys["ArrowRight"]) {
			rotVec.y -= 1.0;
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
			let oldDir = this.rendering.camera.getDir().vector3();
			let newDir = rotMatrix.multiplyVector3(oldDir);
			this.rendering.camera.setDir(
				newDir.elements[0],
				newDir.elements[1],
				newDir.elements[2]
			);
		}

		let particleMovComp = <MovementComponent>(
			this.particleSpawner.getComponent(ComponentTypeEnum.MOVEMENT)
		);
		const particlePosComp = <PositionComponent>(
			this.particleSpawner.getComponent(ComponentTypeEnum.POSITION)
		);
		if (particleMovComp && particlePosComp) {
			particleMovComp.accelerationDirection.deepAssign(
				particlePosComp.position
			);
			particleMovComp.accelerationDirection.y = 0.0;
			particleMovComp.accelerationDirection.multiply(-1.0);
			this.particleText.position = particlePosComp.position;
		}

		if (input.keys["e"] || input.keys["E"]) {
			let boxPosComp = <PositionComponent>(
				this.boxEntity.getComponent(ComponentTypeEnum.POSITION)
			);
			boxPosComp.position
				.deepAssign(this.rendering.camera.getPosition())
				.add(this.rendering.camera.getDir());

			let boxMovComp = <MovementComponent>(
				this.boxEntity.getComponent(ComponentTypeEnum.MOVEMENT)
			);
			boxMovComp.velocity
				.deepAssign(this.rendering.camera.getDir())
				.multiply(15.0);
		}

		if (input.keys["p"] || input.keys["P"]) {
			this.gotoState = StatesEnum.MAINMENU;
		}

		this.ecsManager.update(dt);
	}

	prepareDraw(dt: number): void {
		this.ecsManager.updateRenderingSystems(dt);
	}

	draw() {
		this.rendering.draw();
	}
}
