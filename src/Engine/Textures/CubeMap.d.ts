import Texture from "./Texture";
export default class CubeMap extends Texture {
    private sidesLoaded;
    constructor(useMipMap?: boolean, internalFormat?: number, format?: number, dataStorageType?: number, textureTarget?: number);
    /**
     *
     * @param data - the data to set for the texture
     * @param width - width of the texture
     * @param height - height of the texture
     * @param face - cubemap face to set, leave empty to set data for all faces
     */
    setTextureData(data: Uint8Array, width: number, height: number, face?: number): void;
    loadCubemap(URLs: [string, string, string, string, string, string]): void;
}
