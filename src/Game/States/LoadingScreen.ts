import Progress from "../../Engine/GUI/Progress.js";
import State, { StatesEnum } from "../../Engine/State.js";
import TextObject2D from "../../Engine/GUI/Text/TextObject2D.js";
import { StateAccessible } from "../GameMachine.js";
import Texture from "../../Engine/Textures/Texture.js";
import { OverlayRendering } from "../../Engine/Rendering/OverlayRendering.js";

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
			"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png",
			"https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/371b6fdf-69a3-4fa2-9ff0-bd04d50f4b98/de8synv-6aad06ab-ed16-47fd-8898-d21028c571c4.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzM3MWI2ZmRmLTY5YTMtNGZhMi05ZmYwLWJkMDRkNTBmNGI5OFwvZGU4c3ludi02YWFkMDZhYi1lZDE2LTQ3ZmQtODg5OC1kMjEwMjhjNTcxYzQucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.wa-oSVpeXEpWqfc_bexczFs33hDFvEGGAQD969J7Ugw",
			"https://as2.ftcdn.net/v2/jpg/01/99/14/99/1000_F_199149981_RG8gciij11WKAQ5nKi35Xx0ovesLCRaU.jpg",
			"Assets/textures/fire.png",
			"Assets/textures/knight.png",
			"Assets/textures/black_fur.png",
			"Assets/textures/medium_fur.png",
			"Assets/textures/fur.png",
			"Assets/textures/black.png",
			"Assets/textures/monu9.png",
			"Assets/textures/test.png",
			"Assets/textures/test2.png",
			"Assets/textures/Grass_04.png",
			"Assets/textures/stylized-grass1_albedo.png",
			// "Assets/textures/stylized-grass2_albedo.png",
			"Assets/textures/stylized-grass1_ao.png",
			"Assets/textures/GrassStraw.png",
			"Assets/textures/GrassStraw_Spec.png",
			"Assets/textures/grassFloor.png",
		];

		let cubeMaps = ["Assets/textures/skyboxes/learnopengl"];

		// Meshes to load
		let meshes = [
			"Assets/objs/body.obj",
			"Assets/objs/front_leg.obj",
			"Assets/objs/hind_leg.obj",
			"Assets/objs/cube.obj",
			"Assets/objs/knight.obj",
			"Assets/objs/monu9.obj",
		];
		this.meshesRequested = meshes.length;
		this.meshesLoaded = 0;

		// Heightmaps to load
		let heightmaps: (string | number)[][] = [
			["Assets/textures/heightmap.png", 200, 200, 1.0, 1.0],
			// ["Assets/textures/heightmap.png"]
		];
		this.heightmapsRequested = heightmaps.length;
		this.heightmapsLoaded = 0;

		// Octrees to create
		this.octreesToLoad = [
			["Assets/textures/heightmap.png", 0.05, 100],
			["Assets/objs/knight.obj", 0.1, 100],
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
			this.gotoState = StatesEnum.MAINMENU;
		}
	}

	draw() {
		this.overlayRendering.draw();
	}
}
