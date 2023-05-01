import Heightmap from "../Objects/Heightmap";
import Mesh from "../Objects/Mesh";
import Octree from "../Objects/Octree";
export default class MeshStore {
    private meshMap;
    private heightmapMap;
    private octreeMap;
    constructor();
    getMesh(path: string, printWarnings?: boolean): Mesh;
    loadMesh(path: string): Promise<Mesh>;
    getHeightmap(path: string, printWarnings?: boolean): Heightmap;
    loadHeightmap(path: string, useTextureSizeForResolution?: boolean, x?: number, y?: number, sizePerX?: number, sizePerY?: number): Promise<Heightmap>;
    getOctree(path: string, printWarnings?: boolean): Octree;
    loadOctree(path: string, smallestOctreeNodeSizeMultiplicator: number, maxShapesPerOctreeNode: number, timeLimit?: number): Promise<{
        octree: Octree;
        doneLoading: boolean;
    }>;
    downloadOctrees(): void;
    private parseObjContent;
}
