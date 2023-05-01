import GraphicsBundle from "../Engine/Objects/GraphicsBundle";
import Scene from "../Engine/Rendering/Scene";
import Doggo from "./Player";
export default class GrassHandler {
    private grassSpawners;
    private grassStrawsPerSpawner;
    private grassStrawsSpawned;
    private grassSpawnerSide;
    private grassElevationCutoff;
    private scene;
    private mapBundle;
    private doggo;
    constructor(scene: Scene, mapBundle: GraphicsBundle, doggo: Doggo);
    createGrass(offsetX: any, offsetY: any): void;
    /**
     * Spawn as much grass as possible within 20 milliseconds or until all grass straws have been spawned
     */
    fillGrass(): void;
    updateGrass(): void;
    update(dt: number): void;
}
