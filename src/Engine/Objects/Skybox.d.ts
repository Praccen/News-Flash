import GraphicsObject from "./GraphicsObject";
import ShaderProgram from "../ShaderPrograms/ShaderProgram";
import CubeMap from "../Textures/CubeMap";
export default class Skybox extends GraphicsObject {
    texture: CubeMap;
    private vertices;
    private indices;
    constructor(shaderProgram: ShaderProgram, texture: CubeMap);
    draw(): void;
}
