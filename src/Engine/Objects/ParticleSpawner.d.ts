import GraphicsObject from "./GraphicsObject";
import Texture from "../Textures/Texture";
import Vec3 from "../Maths/Vec3";
import ShaderProgram from "../ShaderPrograms/ShaderProgram";
export default class ParticleSpawner extends GraphicsObject {
    texture: Texture;
    fadePerSecond: number;
    sizeChangePerSecond: number;
    private numParticles;
    private vertices;
    private indices;
    private instanceVBO;
    constructor(shaderProgram: ShaderProgram, texture: Texture, numberOfStartingParticles?: number);
    setNumParticles(amount: number): void;
    getNumberOfParticles(): number;
    setParticleData(particleIndex: number, startPosition: Vec3, size: number, startVel: Vec3, acceleration: Vec3): boolean;
    setParticleStartPosition(particleIndex: number, position: Vec3): boolean;
    setParticleSize(particleIndex: number, size: number): boolean;
    setParticleStartVelocity(particleIndex: number, vel: Vec3): boolean;
    setParticleStartTime(particleIndex: number, time: number): boolean;
    resetParticleStartTime(particleIndex: number): boolean;
    setParticleAcceleration(particleIndex: number, acc: Vec3): boolean;
    private bufferSubDataUpdate;
    draw(): void;
}
