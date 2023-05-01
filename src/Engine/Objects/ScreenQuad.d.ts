import GraphicsObject from "./GraphicsObject";
import Texture from "../Textures/Texture";
import ShaderProgram from "../ShaderPrograms/ShaderProgram";
export default class ScreenQuad extends GraphicsObject {
    textures: Array<Texture>;
    private vertices;
    private indices;
    constructor(shaderProgram: ShaderProgram, textures: Array<Texture>);
    draw(bindTextures?: boolean): void;
}
