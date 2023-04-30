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
import GraphicsBundle from "../../Engine/Objects/GraphicsBundle.js";
import Heightmap from "../../Engine/Objects/Heightmap.js";
import { IntersectionTester } from "../../Engine/Physics/IntersectionTester.js";
import Ray from "../../Engine/Physics/Shapes/Ray.js";
import Triangle from "../../Engine/Physics/Shapes/Triangle.js";
import { OverlayRendering } from "../../Engine/Rendering/OverlayRendering.js";
import { gl } from "../../main.js";
import Scene from "../../Engine/Rendering/Scene.js";
import GrassHandler from "../GrassHandler.js";
import ObjectPlacer from "../ObjectPlacer.js";
import DeliveryZone from "../DeliveryZone.js";
import TextObject2D from "../../Engine/GUI/Text/TextObject2D.js";
import Vec3 from "../../Engine/Maths/Vec3.js";

export default class Game extends State {
	rendering: Rendering;
	ecsManager: ECSManager;
	private deliveryZones: Array<DeliveryZone>;
	private stateAccessible: StateAccessible;

	private overlayRendering: OverlayRendering;
	private menuButton: Button;
	private scoreText: TextObject2D;
	private gameTimeText: TextObject2D;
	private player: Player;
	private mapBundle: GraphicsBundle;
	private grassHandler: GrassHandler;
	private gameTimer: number;

	objectPlacer: ObjectPlacer;

	private scene: Scene;

	constructor(sa: StateAccessible) {
		super();
		this.stateAccessible = sa;

		this.objectPlacer = new ObjectPlacer();
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

		this.deliveryZones = new Array<DeliveryZone>();
		this.deliveryZones.push(new DeliveryZone(new Vec3([0, 0, 0]), 20));

		this.createMapEntity();

		let dirLight = this.scene.getDirectionalLight();
		dirLight.ambientMultiplier = 0.5;
		dirLight.direction.setValues(0.05, -0.4, -0.7);
		dirLight.colour.setValues(0.3, 0.25, 0.2);

		this.player = new Player(
			this.scene,
			this.rendering,
			this.ecsManager,
			this.deliveryZones
		);

		this.grassHandler = new GrassHandler(
			this.scene,
			this.mapBundle,
			this.player
		);

		this.gameTimer = 1000.0;

		this.menuButton = this.overlayRendering.getNewButton();
		this.menuButton.position.x = 0.9;
		this.menuButton.position.y = 0.0;
		this.menuButton.textSize = 40;
		this.menuButton.getInputElement().style.backgroundColor = "transparent";
		this.menuButton.getInputElement().style.borderColor = "transparent";
		this.menuButton.getInputElement().style.color = "white";
		this.menuButton.getInputElement().style.textShadow =
			"-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
		this.menuButton.textString = "Menu";

		this.scoreText = this.overlayRendering.getNew2DText();
		this.scoreText.position.x = 0.1;
		this.scoreText.position.y = 0.05;
		this.scoreText.textString = "0";
		this.scoreText.getElement().style.color = "white";
		this.scoreText.getElement().style.textShadow =
			"-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";

		this.gameTimeText = this.overlayRendering.getNew2DText();
		this.gameTimeText.position.x = 0.15;
		this.gameTimeText.position.y = 0.05;
		this.gameTimeText.textString = "0";
		this.gameTimeText.getElement().style.color = "white";
		this.gameTimeText.getElement().style.textShadow =
			"-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";

		let self = this;
		this.menuButton.onClick(function () {
			self.gotoState = StatesEnum.MAINMENU;
		});

		this.rendering.setSkybox("Assets/textures/skyboxes/LordKitty");

		await this.objectPlacer.load(this.scene, this.ecsManager);

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
		document.getElementById("gameDiv").requestPointerLock();
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

	onExit(e: BeforeUnloadEvent) {
		this.objectPlacer.onExit(e);
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

	update(dt: number) {
		this.player.update(dt);
		this.gameTimer -= dt;

		if (this.gameTimer <= 0.0) {
			this.gotoState = StatesEnum.MAINMENU;
		}

		this.scoreText.textString = this.player.score.toString();
		this.gameTimeText.textString = Math.floor(this.gameTimer).toString();

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
