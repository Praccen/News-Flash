import MeshStore from "../Engine/AssetHandling/MeshStore";
import ECSManager from "../Engine/ECS/ECSManager";
import Entity from "../Engine/ECS/Entity";
import Vec3 from "../Engine/Maths/Vec3";
import Ray from "../Engine/Physics/Shapes/Ray";
import Scene from "../Engine/Rendering/Scene";
import Game from "./States/Game";
export default class ObjectPlacer {
    private placements;
    private transformsAdded;
    private scene;
    private ecsManager;
    private meshStore;
    private currentlyEditingTransform;
    private currentlyEditingPlacement;
    game: Game;
    constructor(meshStore: MeshStore);
    load(scene: Scene, ecsManager: ECSManager): Promise<void>;
    placeObject(type: string, position: Vec3, size: number, rotation: Vec3, saveToTransforms?: boolean): Entity;
    rayCastToSelectNewObject(ray: Ray): void;
    updateCurrentlyEditingObject(rotationChange: number, scaleChange: number, newPosition?: Vec3): void;
    downloadTransforms(): void;
    onExit(e: BeforeUnloadEvent): void;
}
