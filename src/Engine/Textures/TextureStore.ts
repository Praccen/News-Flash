import Texture from "./Texture.js";

export default class TextureStore {
	private textures: Map<string, Texture>;

	constructor() {
		this.textures = new Map<string, Texture>();
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
}
