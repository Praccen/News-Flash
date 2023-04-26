import ECSManager from "../../Engine/ECS/ECSManager.js";
import GraphicsComponent from "../../Engine/ECS/Components/GraphicsComponent.js";
import PositionComponent from "../../Engine/ECS/Components/PositionComponent.js";
import CollisionComponent from "../../Engine/ECS/Components/CollisionComponent.js";
import BoundingBoxComponent from "../../Engine/ECS/Components/BoundingBoxComponent.js";
import State, { StatesEnum } from "../../Engine/State.js";
import Rendering from "../../Engine/Rendering/Rendering.js";
import { input, options, StateAccessible } from "../GameMachine.js";
import Doggo from "../Doggo.js";
import Button from "../../Engine/GUI/Button.js";
import MeshCollisionComponent from "../../Engine/ECS/Components/MeshCollisionComponent.js";
import Vec3 from "../../Engine/Maths/Vec3.js";
import GrassSpawner from "../../Engine/Objects/GrassSpawner.js";
import Vec2 from "../../Engine/Maths/Vec2.js";
import GraphicsBundle from "../../Engine/Objects/GraphicsBundle.js";
import Heightmap from "../../Engine/Objects/Heightmap.js";
import { IntersectionTester } from "../../Engine/Physics/IntersectionTester.js";
import Ray from "../../Engine/Physics/Shapes/Ray.js";
import Triangle from "../../Engine/Physics/Shapes/Triangle.js";
import { WebUtils } from "../../Engine/Utils/WebUtils.js";
import { OverlayRendering } from "../../Engine/Rendering/OverlayRendering.js";
import { gl } from "../../main.js";
import Scene from "../../Engine/Rendering/Scene.js";
import ParticleSpawnerComponent from "../../Engine/ECS/Components/ParticleSpawnerComponent.js";
import PointLightComponent from "../../Engine/ECS/Components/PointLightComponent.js";

export default class Game extends State {
	rendering: Rendering;
	ecsManager: ECSManager;
	private stateAccessible: StateAccessible;

	private overlayRendering: OverlayRendering;
	private menuButton: Button;
	private doggo: Doggo;
	private mapBundle: GraphicsBundle;

	private grassSpawners: Array<{ spawner: GrassSpawner; offset: Vec2 }>;
	private grassStrawsPerSpawner: number;
	private grassStrawsSpawned: number;
	private grassSpawnerSide: number;

	private treesAdded: boolean;
	private treeTransforms: Array<{ pos: Vec3; rot: Vec3; size: number }>;

	private scene: Scene;

	constructor(sa: StateAccessible) {
		super();
		this.stateAccessible = sa;

		this.treesAdded = false;
		this.treeTransforms = new Array<{ pos: Vec3; size: number; rot: Vec3 }>();
	}

	async load() {
		this.scene = new Scene(
			this.stateAccessible.textureStore,
			this.stateAccessible.meshStore
		);
		this.rendering = new Rendering(
			this.stateAccessible.textureStore,
			this.scene
		);
		this.ecsManager = new ECSManager(this.rendering);
		this.overlayRendering = new OverlayRendering(this.rendering.camera);

		this.rendering.clearColour.r = 0.2;
		this.rendering.clearColour.g = 0.3;
		this.rendering.clearColour.b = 0.7;
		// this.rendering.clearColour.r = 0.1;
		// this.rendering.clearColour.g = 0.1;
		// this.rendering.clearColour.b = 0.1;

		// Textures
		let floorTexture =
			"https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/371b6fdf-69a3-4fa2-9ff0-bd04d50f4b98/de8synv-6aad06ab-ed16-47fd-8898-d21028c571c4.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzM3MWI2ZmRmLTY5YTMtNGZhMi05ZmYwLWJkMDRkNTBmNGI5OFwvZGU4c3ludi02YWFkMDZhYi1lZDE2LTQ3ZmQtODg5OC1kMjEwMjhjNTcxYzQucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.wa-oSVpeXEpWqfc_bexczFs33hDFvEGGAQD969J7Ugw";

		this.createFloorEntity(floorTexture);

		this.createMapEntity();

		this.createKnight();

		this.createParticleSpawner();

		this.grassSpawners = new Array<{ spawner: GrassSpawner; offset: Vec2 }>();
		this.grassStrawsPerSpawner = 10000;
		this.grassStrawsSpawned = 0;
		this.grassSpawnerSide = 30;

		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				this.createGrass(
					i * this.grassSpawnerSide,
					10 + j * this.grassSpawnerSide
				);
			}
		}

		this.rendering.camera.setPosition(0.0, 0.0, 5.5);

		this.scene.getDirectionalLight().ambientMultiplier = 0.3;

		this.doggo = new Doggo(this.scene, this.rendering, this.ecsManager);

		this.menuButton = this.overlayRendering.getNewButton();
		this.menuButton.position.x = 0.9;
		this.menuButton.position.y = 0.0;
		this.menuButton.textSize = 60;
		this.menuButton.getInputElement().style.backgroundColor = "transparent";
		this.menuButton.getInputElement().style.borderColor = "transparent";
		this.menuButton.getInputElement().style.color = "white";
		this.menuButton.getInputElement().style.padding = "10px";
		this.menuButton.textString = "Menu";

		let self = this;
		this.menuButton.onClick(function () {
			self.gotoState = StatesEnum.MAINMENU;
		});

		this.rendering.setSkybox("Assets/textures/skyboxes/learnopengl");

		if (this.treeTransforms.length == 0) {
			// let transforms = WebUtils.GetCookie("treeTransforms");
			const response = await fetch("Assets/placements/TreeTransforms.txt");
			if (response.ok) {
				const transforms = await response.text();

				if (transforms != "") {
					for (let t of transforms.split("\n")) {
						t = t.trim();
						if (t == "") {
							break;
						}
						let [p, s, r] = t.split("|");
						let temp = {
							pos: new Vec3(p.split(",").map((n) => parseFloat(n))),
							size: parseFloat(s),
							rot: new Vec3(r.split(",").map((n) => parseFloat(n))),
						};
						this.treeTransforms.push(temp);
					}
				}
			}
		}

		// Create the trees
		for (let transform of this.treeTransforms) {
			this.placeTree(transform.pos, transform.size, transform.rot, false);
		}

		await this.doggo.init();
	}

	async init() {
		super.init();
		if (this.stateAccessible.restartGame) {
			if (this.menuButton) {
				this.menuButton.remove();
			}
			await this.load();
			this.stateAccessible.restartGame = false;
		}

		this.overlayRendering.show();
		this.rendering.useCrt = options.useCrt;
		this.rendering.useBloom = options.useBloom;
	}

	reset() {
		super.reset();
		if (this.overlayRendering) {
			this.overlayRendering.hide();
		}
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		input.touchUsed = false;
		input.drawTouchControls();
	}

	downloadTransforms() {
		let treeTransformsData = "";

		for (let treeTransform of this.treeTransforms) {
			treeTransformsData +=
				treeTransform.pos +
				"|" +
				treeTransform.size +
				"|" +
				treeTransform.rot +
				"\n";
		}

		WebUtils.DownloadFile("TreeTransforms.txt", treeTransformsData);
	}

	onExit(e: BeforeUnloadEvent) {
		if (this.treeTransforms.length > 0 && this.treesAdded) {
			this.downloadTransforms();

			e.preventDefault();
			e.returnValue = "";
			return;
		}

		delete e["returnValue"];
	}

	createFloorEntity(texturePath: string) {
		let entity = this.ecsManager.createEntity();
		let phongQuad = this.scene.getNewPhongQuad(texturePath, texturePath);
		phongQuad.textureMatrix.setScale(50.0, 50.0, 1.0);
		this.ecsManager.addComponent(entity, new GraphicsComponent(phongQuad));
		let posComp = new PositionComponent();
		posComp.position.setValues(0.0, -2.0, 0.0);
		posComp.rotation.setValues(-90.0, 0.0, 0.0);
		posComp.scale.setValues(30.0, 30.0, 1.0);
		this.ecsManager.addComponent(entity, posComp);

		// Collision stuff
		let boundingBoxComp = new BoundingBoxComponent();
		boundingBoxComp.setup(phongQuad.graphicsObject);
		boundingBoxComp.updateTransformMatrix(phongQuad.modelMatrix);
		this.ecsManager.addComponent(entity, boundingBoxComp);
		let collisionComp = new CollisionComponent();
		collisionComp.isStatic = true;
		this.ecsManager.addComponent(entity, collisionComp);
	}

	createMapEntity() {
		let texturePath = "Assets/textures/heightmap.png";
		let texturePathColour = "Assets/textures/grassFloor.png";
		let texturePathSpec = "Assets/textures/grassFloor.png";
		let entity = this.ecsManager.createEntity();
		this.mapBundle = this.scene.getNewHeightMap(
			texturePath,
			texturePathColour,
			texturePathSpec
		);

		this.ecsManager.addComponent(entity, new GraphicsComponent(this.mapBundle));
		let posComp = new PositionComponent();
		posComp.position.setValues(0.0, -5.0, 10.0);
		posComp.scale.setValues(1.0, 40.0, 1.0);
		this.ecsManager.addComponent(entity, posComp);

		// Collision stuff
		let boundingBoxComp = new BoundingBoxComponent();
		boundingBoxComp.setup(this.mapBundle.graphicsObject);
		boundingBoxComp.updateTransformMatrix(this.mapBundle.modelMatrix);
		this.ecsManager.addComponent(entity, boundingBoxComp);
		let collisionComp = new CollisionComponent();
		collisionComp.isStatic = true;
		this.ecsManager.addComponent(entity, collisionComp);
		let meshColComp = new MeshCollisionComponent(
			this.stateAccessible.meshStore.getOctree("Assets/textures/heightmap.png")
		);
		meshColComp.octree.setModelMatrix(this.mapBundle.modelMatrix);
		this.ecsManager.addComponent(entity, meshColComp);

		// Update the model matrix and mark the octree to be updated
		posComp.calculateMatrix(this.mapBundle.modelMatrix);
		meshColComp.octree.setModelMatrix();
	}

	createKnight() {
		let texturePath = "Assets/textures/knight.png";
		let entity = this.ecsManager.createEntity();
		let knightMesh = this.scene.getNewMesh(
			"Assets/objs/knight.obj",
			texturePath,
			texturePath
		);
		this.ecsManager.addComponent(entity, new GraphicsComponent(knightMesh));
		let knightPosComp = new PositionComponent();
		knightPosComp.position.setValues(0.0, -5.0, 20.0);
		this.ecsManager.addComponent(entity, knightPosComp);

		// Collision stuff
		let boundingBoxComp = new BoundingBoxComponent();
		boundingBoxComp.setup(knightMesh.graphicsObject);
		boundingBoxComp.updateTransformMatrix(knightMesh.modelMatrix);
		this.ecsManager.addComponent(entity, boundingBoxComp);
		let collisionComp = new CollisionComponent();
		collisionComp.isStatic = true;
		this.ecsManager.addComponent(entity, collisionComp);
		let meshColComp = new MeshCollisionComponent(
			this.stateAccessible.meshStore.getOctree("Assets/objs/knight.obj")
		);
		meshColComp.octree.setModelMatrix(knightMesh.modelMatrix);
		this.ecsManager.addComponent(entity, meshColComp);
	}

	createParticleSpawner() {
		let position = new Vec3([2.0, 0.0, 0.0]);
		let numParticles = 1000;
		let lifeTime = 4;
		let texturePath = "Assets/textures/fire.png";

		let particleSpawner = this.scene.getNewParticleSpawner(
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
				new Vec3([Math.cos(rand), 5.0 + Math.random() * 20.0, Math.sin(rand)])
					.normalize()
					.multiply(8.0 + Math.random() * 3.0),
				new Vec3([0.0, -4.0, 0.0])
			);
		}

		let entity = this.ecsManager.createEntity();
		let posComp = new PositionComponent();
		posComp.position.deepAssign(position);
		this.ecsManager.addComponent(entity, posComp);
		let particleComp = new ParticleSpawnerComponent(particleSpawner);
		particleComp.lifeTime = lifeTime;
		this.ecsManager.addComponent(entity, particleComp);

		let particleLight = this.scene.getNewPointLight();
		particleLight.colour.setValues(0.5, 0.25, 0.0);
		let particleLightComp = new PointLightComponent(particleLight);
		particleLightComp.posOffset.setValues(0.0, 0.3, 0.0);
		this.ecsManager.addComponent(entity, particleLightComp);
		return entity;
	}

	createGrass(offsetX, offsetY) {
		let texturePathColour = "Assets/textures/GrassStraw.png";
		let texturePathSpec = "Assets/textures/GrassStraw_Spec.png";

		let bundle = this.scene.getNewGrassSpawner(
			texturePathColour,
			texturePathSpec,
			this.grassStrawsPerSpawner
		);
		if (Math.random() > 0.5) {
			bundle.emission = this.stateAccessible.textureStore.getTexture(
				"Assets/textures/GrassStraw_Spec.png"
			);
		}

		this.grassSpawners.push({
			spawner: bundle.graphicsObject as GrassSpawner,
			offset: new Vec2([offsetX, offsetY]),
		});
	}

	/**
	 * Spawn as much grass as possible within 20 milliseconds or until all grass straws have been spawned
	 */
	fillGrass() {
		let startTime = Date.now();

		let sqrt = Math.pow(this.grassStrawsPerSpawner, 0.5);
		let strawDist = this.grassSpawnerSide / sqrt;

		let invertedMatrix = new Matrix4(this.mapBundle.modelMatrix).invert(); // Invert the transform matrix used for the heightmap

		let data = new Array<number>();
		let firstIndex = this.grassStrawsSpawned % this.grassStrawsPerSpawner;
		let lastSpawnerIndex = Math.floor(
			this.grassStrawsSpawned / this.grassStrawsPerSpawner
		);

		// Spawn as much grass as possible within 20 milliseconds every frame until all grass straws have been spawned
		while (
			Date.now() - startTime < 20 &&
			this.grassStrawsSpawned <
				this.grassSpawners.length * this.grassStrawsPerSpawner
		) {
			let spawnerIndex = Math.floor(
				this.grassStrawsSpawned / this.grassStrawsPerSpawner
			);
			let i = this.grassStrawsSpawned % this.grassStrawsPerSpawner;

			if (lastSpawnerIndex != spawnerIndex) {
				// Switching spawner, update the data for the previous one
				this.grassSpawners[lastSpawnerIndex].spawner.bufferSubDataUpdate(
					firstIndex * 7,
					new Float32Array(data)
				);

				// Clear data and reset index
				data.length = 0;
				firstIndex = 0;
			}

			lastSpawnerIndex = spawnerIndex;

			let offset = this.grassSpawners[spawnerIndex].offset;
			let grassStrawPosition = new Vec3([
				// Grass position (x and z)
				offset.x + (i % sqrt) * strawDist + strawDist * (Math.random() - 0.5),
				0.0,
				offset.y +
					Math.floor(i / sqrt) * strawDist +
					strawDist * (Math.random() - 0.5),
			]);

			// Get the height of the heightmap at the corresponding position
			let height = (<Heightmap>(
				this.mapBundle.graphicsObject
			)).getHeightFromWorldPosition(
				this.mapBundle.modelMatrix,
				grassStrawPosition,
				invertedMatrix
			);
			let size = 0.0;

			if (height != null) {
				// Given that the x and z coords of the position are on the heightmap
				grassStrawPosition.y = height;
				size = Math.random() * 0.5 + 0.3;
			}

			data.push(...grassStrawPosition); // Position of straw
			data.push(size); // Size of straw
			data.push(
				...[
					(Math.random() - 0.5) * 0.1,
					(Math.random() - 0.5) * 0.1,
					(Math.random() - 0.5) * 0.1,
				]
			); // TipOffset

			this.grassStrawsSpawned++;
		}

		this.grassSpawners[lastSpawnerIndex].spawner.bufferSubDataUpdate(
			firstIndex * 7,
			new Float32Array(data)
		);
	}

	updateGrass() {
		const doggoPosition = this.doggo.getPosition();
		const doggoVelocity = this.doggo.getVelocity();

		let sqrt = Math.pow(this.grassStrawsPerSpawner, 0.5);
		let strawDist = this.grassSpawnerSide / sqrt;

		let invertedMatrix = new Matrix4(this.mapBundle.modelMatrix).invert(); // Invert the transform matrix used for the heightmap

		for (let grassSpawner of this.grassSpawners) {
			if (
				grassSpawner.offset.x > doggoPosition.x - this.grassSpawnerSide &&
				grassSpawner.offset.x < doggoPosition.x &&
				grassSpawner.offset.y > doggoPosition.z - this.grassSpawnerSide &&
				grassSpawner.offset.y < doggoPosition.z
			) {
				if (
					doggoPosition.y -
						(<Heightmap>(
							this.mapBundle.graphicsObject
						)).getHeightFromWorldPosition(
							this.mapBundle.modelMatrix,
							doggoPosition,
							invertedMatrix
						) <
					1.0
				) {
					let diffX = doggoPosition.x - grassSpawner.offset.x;
					let diffY = doggoPosition.z - grassSpawner.offset.y;

					let middleX = Math.floor(diffX / strawDist);
					let middleY = Math.floor(diffY / strawDist);

					for (let x = middleX - 10; x < middleX + 11; x++) {
						for (let y = middleY - 10; y < middleY + 11; y++) {
							let dist = new Vec2([
								x * strawDist - diffX,
								y * strawDist - diffY,
							]);
							if (dist.len() < 0.3) {
								let index = Math.floor(x + y * sqrt);
								if (index > 0 && index < this.grassStrawsPerSpawner) {
									let offset = new Vec3([doggoVelocity.x, 0.0, doggoVelocity.z])
										.normalize()
										.multiply(0.2);
									offset.y = -0.2;
									grassSpawner.spawner.setGrassTipOffset(index, offset);
								}
							}
						}
					}
				}
			}
		}
	}

	doRayCast(ray: Ray): number {
		let triangleArray = new Array<Triangle>();
		this.stateAccessible.meshStore
			.getOctree("Assets/textures/heightmap.png")
			.getShapesForRayCast(ray, triangleArray);
		return IntersectionTester.doRayCast(ray, triangleArray);
	}

	placeTree(
		position: Vec3,
		size: number,
		rotation: Vec3,
		saveToTransforms: boolean = true
	) {
		let texturePath = "Assets/textures/knight.png";
		let entity = this.ecsManager.createEntity();
		let knightMesh = this.scene.getNewMesh(
			"Assets/objs/knight.obj",
			texturePath,
			texturePath
		);
		this.ecsManager.addComponent(entity, new GraphicsComponent(knightMesh));
		let posComp = new PositionComponent();
		posComp.position.deepAssign(position);
		posComp.scale.setValues(size, size, size);
		posComp.rotation.deepAssign(rotation);
		this.ecsManager.addComponent(entity, posComp);

		if (saveToTransforms) {
			this.treeTransforms.push({ pos: position, size: size, rot: rotation });
			this.treesAdded = true;
		}

		// Collision stuff
		let boundingBoxComp = new BoundingBoxComponent();
		boundingBoxComp.setup(knightMesh.graphicsObject);
		boundingBoxComp.updateTransformMatrix(knightMesh.modelMatrix);
		this.ecsManager.addComponent(entity, boundingBoxComp);
		let collisionComp = new CollisionComponent();
		collisionComp.isStatic = true;
		this.ecsManager.addComponent(entity, collisionComp);
		// let meshColComp = new MeshCollisionComponent(this.stateAccessible.meshStore.getOctree("Assets/objs/knight.obj"));
		// meshColComp.octree.setModelMatrix(knightMesh.modelMatrix);
		// this.ecsManager.addComponent(entity, meshColComp);
	}

	update(dt: number) {
		if (
			this.grassStrawsSpawned <
			this.grassSpawners.length * this.grassStrawsPerSpawner
		) {
			this.fillGrass();
		}

		this.doggo.update(dt);

		if (options.foldableGrass) {
			this.updateGrass();
		}

		if (input.keys["P"]) {
			this.doggo.respawn();
		}

		if (input.keys["O"]) {
			this.gotoState = StatesEnum.DEBUGMODE;
		}

		this.ecsManager.update(dt);
	}

	prepareDraw(dt: number): void {
		this.ecsManager.updateRenderingSystems(dt);
	}

	draw() {
		this.rendering.draw();
		this.overlayRendering.draw();
		input.drawTouchControls();
	}
}
