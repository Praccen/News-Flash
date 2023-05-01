import Texture from "../Textures/Texture";
import GraphicsObject from "./GraphicsObject";
export default class GraphicsBundle {
    modelMatrix: Matrix4;
    textureMatrix: Matrix4;
    diffuse: Texture;
    specular: Texture;
    emission: Texture;
    baseColor: Vector3;
    graphicsObject: GraphicsObject;
    constructor(diffuse: Texture, specular: Texture, graphicsObject: GraphicsObject, emissionMap?: Texture);
    draw(bindSpecialTextures?: boolean): void;
}
