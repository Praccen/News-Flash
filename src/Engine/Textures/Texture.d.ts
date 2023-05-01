export default class Texture {
    width: number;
    height: number;
    texture: WebGLTexture;
    loadedFromFile: boolean;
    protected useMipMap: boolean;
    protected internalFormat: number;
    protected format: number;
    protected dataStorageType: number;
    protected textureTarget: number;
    constructor(useMipMap?: boolean, internalFormat?: number, format?: number, dataStorageType?: number, textureTarget?: number);
    setTextureData(data: Uint8Array, width: number, height: number): void;
    bind(textureIndex?: number): void;
    loadFromFile(URL: string): void;
    setTexParameterI(a: number, b: number): void;
}
