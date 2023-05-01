import GraphicsObject from "./GraphicsObject";
import Vec3 from "../Maths/Vec3";
import ShaderProgram from "../ShaderPrograms/ShaderProgram";
export default class GrassSpawner extends GraphicsObject {
    private numGrassStraws;
    private vertices;
    private instanceVBO;
    constructor(shaderProgram: ShaderProgram, numberOfStartingGrassStraws?: number);
    setNumGrassStraws(amount: number): void;
    getNumberOfGrassStraws(): number;
    setGrassStrawData(particleIndex: number, startPosition: Vec3, size: number, tipOffset: Vec3): boolean;
    setGrassStrawPosition(particleIndex: number, position: Vec3): boolean;
    setGrassStrawSize(particleIndex: number, size: number): boolean;
    setGrassTipOffset(particleIndex: number, offset: Vec3): boolean;
    bufferSubDataUpdate(start: number, data: Float32Array): boolean;
    draw(): void;
}
