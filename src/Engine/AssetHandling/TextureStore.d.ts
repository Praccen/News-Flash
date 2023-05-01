import CubeMap from "../Textures/CubeMap";
import Texture from "../Textures/Texture";
export default class TextureStore {
    private textures;
    private cubeMaps;
    constructor();
    getTexture(path: string): Texture;
    getCubeMap(path: string): CubeMap;
}
