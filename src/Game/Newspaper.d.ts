import ECSManager from "../Engine/ECS/ECSManager";
import Entity from "../Engine/ECS/Entity";
import Vec3 from "../Engine/Maths/Vec3";
import Scene from "../Engine/Rendering/Scene";
export default class Newspaper {
    private ecsManager;
    private scene;
    entity: Entity;
    constructor(startingPos: Vec3, startingVel: Vec3, startingRot: Vec3, ecsManager: ECSManager, scene: Scene);
    update(dt: number): boolean;
}
