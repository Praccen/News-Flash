import Progress from "../../Engine/GUI/Progress";
import State, { StatesEnum } from "../../Engine/State";
import TextObject2D from "../../Engine/GUI/Text/TextObject2D";
import { StateAccessible } from "../GameMachine";
import Texture from "../../Engine/Textures/Texture";
import { OverlayRendering } from "../../Engine/Rendering/OverlayRendering";

export default class LoadingScreen extends State {
	private overlayRendering: OverlayRendering;
	private sa: StateAccessible;

	private text: TextObject2D;
	private statusText: string;
	private progressBar: Progress;
	private progress: number;
	private timer: number;

	private texturesToLoad: Texture[];
	private meshesRequested: number;
	private meshesLoaded: number;
	private heightmapsRequested: number;
	private heightmapsLoaded: number;
	private octreesToLoad: Object[];
	private octreesRequested: number;
	private octreesLoaded: number;

	constructor(sa: StateAccessible) {
		super();
		this.overlayRendering = new OverlayRendering();
		this.sa = sa;

		// Crate GUI
		this.text = this.overlayRendering.getNew2DText();
		this.text.center = true;
		this.text.position.x = 0.5;
		this.text.position.y = 0.4;
		this.text.size = 50;
		this.statusText = "Loading assets ";

		this.progressBar = this.overlayRendering.getNewProgress();
		this.progressBar.center = true;
		this.progressBar.position.x = 0.5;
		this.progressBar.position.y = 0.5;
		this.progressBar.size = 50;
		this.progressBar.getProgressElement().style.borderRadius = "4px";
		this.progressBar.getProgressElement().max = 1.0;
		this.progressBar.getProgressElement().value = 0.0;
		this.progress = 0;
		this.timer = 0;
	}

	async init() {
		super.init();
		this.overlayRendering.show();
		this.overlayRendering.draw();

		// Load all textures to avoid loading mid game
		let textures = [
			"Assets/textures/fire.png",
			"Assets/textures/knight.png",
			"Assets/textures/black.png",
			"Assets/textures/white.png",
			"Assets/textures/GrassStraw.png",
			"Assets/textures/GrassStraw_Spec.png",
			"Assets/textures/HeightmapTexture.png",
			"Assets/textures/houseTex.png",
			"Assets/textures/houseTex_bright.png",
			"Assets/textures/DZ.png",
			"Assets/textures/BushTexture.png",
			"Assets/textures/Solros.png",
		];

		let cubeMaps = [
			// "Assets/textures/skyboxes/learnopengl",
			"Assets/textures/skyboxes/LordKitty",
		];

		// Meshes to load
		let meshes = [
			"Assets/objs/body.obj",
			"Assets/objs/knight.obj",
			"Assets/objs/house.obj",
			"Assets/objs/mailbox.obj",
			"Assets/objs/newspaper.obj",
			"Assets/objs/fence.obj",
			"Assets/objs/BigBuske.obj",
			"Assets/objs/Solros.obj",
			"Assets/objs/Plant.obj",
			"Assets/objs/SmolBuske.obj",
			"Assets/objs/tree_1.obj",
			"Assets/objs/tree_2.obj",
			"Assets/objs/tree_3.obj",
			"Assets/objs/DeliveryZone.obj",
		];
		this.meshesRequested = meshes.length;
		this.meshesLoaded = 0;

		// Heightmaps to load
		let heightmaps: (string | number)[][] = [
			["Assets/heightmaps/heightmap.png", 200, 200, 1.0, 1.0],
		];
		this.heightmapsRequested = heightmaps.length;
		this.heightmapsLoaded = 0;

		// Octrees to create
		this.octreesToLoad = [
			["Assets/heightmaps/heightmap.png", 0.01, 10],
			["Assets/objs/house.obj", 0.1, 20],
			["Assets/objs/mailbox.obj", 0.1, 20],
			["Assets/objs/BigBuske.obj", 0.1, 20],
			["Assets/objs/Solros.obj", 0.1, 20],
			["Assets/objs/Plant.obj", 0.1, 20],
			["Assets/objs/SmolBuske.obj", 0.1, 20],
			["Assets/objs/tree_1.obj", 0.1, 20],
			["Assets/objs/tree_2.obj", 0.1, 20],
			["Assets/objs/tree_3.obj", 0.1, 20],
		];
		this.octreesRequested = this.octreesToLoad.length;
		this.octreesLoaded = 0;

		this.texturesToLoad = new Array<Texture>();
		for (const texFile of textures) {
			this.texturesToLoad.push(this.sa.textureStore.getTexture(texFile));
		}

		for (const cubeMapFile of cubeMaps) {
			this.texturesToLoad.push(this.sa.textureStore.getCubeMap(cubeMapFile));
		}

		// Load meshes
		for (const meshFile of meshes) {
			this.sa.meshStore.loadMesh(meshFile).then(() => {
				this.meshesLoaded++;
			});
		}

		// Load heightmaps
		for (const heightmapInfo of heightmaps) {
			if (heightmapInfo.length == 5) {
				this.sa.meshStore
					.loadHeightmap(
						heightmapInfo[0] as string,
						false,
						heightmapInfo[1] as number,
						heightmapInfo[2] as number,
						heightmapInfo[3] as number,
						heightmapInfo[4] as number
					)
					.then(() => {
						this.heightmapsLoaded++;
					});
			} else {
				this.sa.meshStore.loadHeightmap(heightmapInfo[0] as string).then(() => {
					this.heightmapsLoaded++;
				});
			}
		}
	}

	reset() {
		super.reset();
		this.overlayRendering.hide();
	}

	update(dt: number) {
		let requestedAssets =
			this.texturesToLoad.length +
			this.meshesRequested +
			this.heightmapsRequested +
			this.octreesRequested;
		let texturesLoaded = 0;
		for (let tex of this.texturesToLoad) {
			if (tex.loadedFromFile) {
				texturesLoaded++;
			}
		}
		let loadedAssets =
			texturesLoaded +
			this.meshesLoaded +
			this.heightmapsLoaded +
			this.octreesLoaded;

		// When all meshes and heightmaps have been loaded, we can start processing octrees
		if (
			this.meshesLoaded == this.meshesRequested &&
			this.heightmapsLoaded == this.heightmapsRequested &&
			this.octreesToLoad.length > 0
		) {
			this.statusText = "Generating octrees ";
			let i = this.octreesToLoad.length - 1;
			let octreeToLoad = this.octreesToLoad[i];
			this.sa.meshStore
				.loadOctree(
					octreeToLoad[0],
					octreeToLoad[1],
					octreeToLoad[2],
					10 /*Give a 10 ms deadline*/
				)
				.then((value) => {
					if (value.doneLoading) {
						if (
							this.octreesToLoad[this.octreesToLoad.length - 1][0] ==
							octreeToLoad[0]
						) {
							this.octreesToLoad.pop(); // Done loading, remove it from the queue
							this.octreesLoaded++; // And increase the number of octrees loaded
						}
					}
				});
		}

		this.timer += dt;

		this.progress = loadedAssets / requestedAssets;
		this.progressBar.getProgressElement().value = this.progress;
		this.text.textString = this.statusText;
		for (let i = 4; i > 1; i--) {
			if (this.timer - Math.floor(this.timer) > 1.0 / i) {
				this.text.textString += "-";
			} else {
				this.text.textString += "_";
			}
		}
		this.text.textString += "  " + Math.ceil(this.progress * 100) + "%";

		if (this.progress >= 1.0 && this.timer >= 0.5) {
			this.gotoState = StatesEnum.GAME;
		}
	}

	draw() {
		this.overlayRendering.draw();
	}
}
