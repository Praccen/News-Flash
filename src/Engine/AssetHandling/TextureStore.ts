import CubeMap from "../Textures/CubeMap.js";
import Texture from "../Textures/Texture.js";

export default class TextureStore {
	private textures: Map<string, Texture>;
	private cubeMaps: Map<string, CubeMap>;

	constructor() {
		this.textures = new Map<string, Texture>();
		this.cubeMaps = new Map<string, CubeMap>();
	}

	getTexture(path: string): Texture {
		let tex = this.textures.get(path);
		if (tex) {
			return tex;
		}

		let newTexture = new Texture();
		newTexture.loadFromFile(path);
		this.textures.set(path, newTexture);
		return newTexture;
	}

	getCubeMap(path: string): CubeMap {
		let cubeMap = this.cubeMaps.get(path);
		if (cubeMap) {
			return cubeMap;
		}

		let newCubeMap = new CubeMap();
		newCubeMap.loadCubemap([
			path + "/right.jpg",
			path + "/left.jpg",
			path + "/bottom.jpg",
			path + "/top.jpg",
			path + "/front.jpg",
			path + "/back.jpg",
		]);
		this.cubeMaps.set(path, newCubeMap);
		return newCubeMap;
	}
}
