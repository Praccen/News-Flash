import ECSManager from "../../Engine/ECS/ECSManager.js";
import GraphicsComponent from "../../Engine/ECS/Components/GraphicsComponent.js";
import PositionComponent from "../../Engine/ECS/Components/PositionComponent.js";
import CollisionComponent from "../../Engine/ECS/Components/CollisionComponent.js";
import BoundingBoxComponent from "../../Engine/ECS/Components/BoundingBoxComponent.js";
import State, { StatesEnum } from "../../Engine/State.js";
import Rendering from "../../Engine/Rendering/Rendering.js";
import { input, options, StateAccessible } from "../GameMachine.js";
import Player from "../Player.js";
import Button from "../../Engine/GUI/Button.js";
import MeshCollisionComponent from "../../Engine/ECS/Components/MeshCollisionComponent.js";
import Vec3 from "../../Engine/Maths/Vec3.js";
import GraphicsBundle from "../../Engine/Objects/GraphicsBundle.js";
import Heightmap from "../../Engine/Objects/Heightmap.js";
import { IntersectionTester } from "../../Engine/Physics/IntersectionTester.js";
import Ray from "../../Engine/Physics/Shapes/Ray.js";
import Triangle from "../../Engine/Physics/Shapes/Triangle.js";
import { WebUtils } from "../../Engine/Utils/WebUtils.js";
import { OverlayRendering } from "../../Engine/Rendering/OverlayRendering.js";
import { gl } from "../../main.js";
import Scene from "../../Engine/Rendering/Scene.js";
import GrassHandler from "../GrassHandler.js";
import MovementComponent from "../../Engine/ECS/Components/MovementComponent.js";

export default class Game extends State {
	rendering: Rendering;
	ecsManager: ECSManager;
	private stateAccessible: StateAccessible;

	private overlayRendering: OverlayRendering;
	private menuButton: Button;
	private player: Player;
	private mapBundle: GraphicsBundle;
	private grassHandler: GrassHandler;

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

		this.createMapEntity();

		this.rendering.camera.setPosition(0.0, 0.0, 5.5);

		this.scene.getDirectionalLight().ambientMultiplier = 0.3;

		this.player = new Player(this.scene, this.rendering, this.ecsManager);

		this.grassHandler = new GrassHandler(
			this.scene,
			this.mapBundle,
			this.player
		);

		this.menuButton = this.overlayRendering.getNewButton();
		this.menuButton.position.x = 0.9;
		this.menuButton.position.y = 0.0;
		this.menuButton.textSize = 40;
		this.menuButton.getInputElement().style.backgroundColor = "transparent";
		this.menuButton.getInputElement().style.borderColor = "transparent";
		this.menuButton.textString = "Menu";

		let self = this;
		this.menuButton.onClick(function () {
			self.gotoState = StatesEnum.MAINMENU;
		});

		this.rendering.setSkybox("Assets/textures/skyboxes/LordKitty");

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

		await this.player.init();
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

	createMapEntity() {
		let texturePath = "Assets/heightmaps/heightmap.png";
		let texturePathColour = "Assets/textures/HeightmapTexture.png";
		let texturePathSpec = "Assets/textures/HeightmapTexture.png";
		let entity = this.ecsManager.createEntity();
		this.mapBundle = this.scene.getNewHeightMap(
			texturePath,
			texturePathColour,
			texturePathSpec
		);

		let heightmap = this.mapBundle.graphicsObject as Heightmap;
		let vertices = heightmap.getVertices();

		for (let i = 0; i < heightmap.xResolution * heightmap.zResolution; i++) {
			if (vertices[i * 8 + 4] > 0.999999999 && vertices[i * 8 + 1] > 0.001) {
				// Normal is pointing upwards and height is not 0 (ditches)
				// Set uvs to be tarmac
				vertices[i * 8 + 6] = 0.75;
			} else {
				// Set uvs to be grass
				vertices[i * 8 + 6] = 0.25;
			}
		}

		heightmap.setVertexData(vertices);

		this.ecsManager.addComponent(entity, new GraphicsComponent(this.mapBundle));
		let posComp = new PositionComponent();
		posComp.position.setValues(-10.0, -4.0, -10.0);
		posComp.scale.setValues(0.5, 2.0, 0.5);
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
			this.stateAccessible.meshStore.getOctree(
				"Assets/heightmaps/heightmap.png"
			)
		);
		meshColComp.octree.setModelMatrix(this.mapBundle.modelMatrix);
		this.ecsManager.addComponent(entity, meshColComp);

		// Update the model matrix and mark the octree to be updated
		posComp.calculateMatrix(this.mapBundle.modelMatrix);
		meshColComp.octree.setModelMatrix();
	}

	doRayCast(ray: Ray): number {
		let triangleArray = new Array<Triangle>();
		this.stateAccessible.meshStore
			.getOctree("Assets/heightmaps/heightmap.png")
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

		this.ecsManager.addComponent(entity, new MovementComponent());

		// Collision stuff
		let boundingBoxComp = new BoundingBoxComponent();
		boundingBoxComp.setup(knightMesh.graphicsObject);
		boundingBoxComp.updateTransformMatrix(knightMesh.modelMatrix);
		this.ecsManager.addComponent(entity, boundingBoxComp);
		let collisionComp = new CollisionComponent();
		// collisionComp.isStatic = true;
		this.ecsManager.addComponent(entity, collisionComp);
		// let meshColComp = new MeshCollisionComponent(this.stateAccessible.meshStore.getOctree("Assets/objs/knight.obj"));
		// meshColComp.octree.setModelMatrix(knightMesh.modelMatrix);
		// this.ecsManager.addComponent(entity, meshColComp);
	}

	update(dt: number) {
		this.player.update(dt);

		this.grassHandler.update(dt);

		if (input.keys["P"]) {
			this.player.respawn();
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
