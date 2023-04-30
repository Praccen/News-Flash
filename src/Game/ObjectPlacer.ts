import BoundingBoxComponent from "../Engine/ECS/Components/BoundingBoxComponent.js";
import CollisionComponent from "../Engine/ECS/Components/CollisionComponent.js";
import GraphicsComponent from "../Engine/ECS/Components/GraphicsComponent.js";
import PositionComponent from "../Engine/ECS/Components/PositionComponent.js";
import ECSManager from "../Engine/ECS/ECSManager.js";
import Vec3 from "../Engine/Maths/Vec3.js";
import Scene from "../Engine/Rendering/Scene.js";
import { WebUtils } from "../Engine/Utils/WebUtils.js";

class Placement {
    modelPath: string;
    placementsPath: string;
    diffuseTexturePath: string;
    specularTexturePath: string;
    transforms: Array<{ pos: Vec3; size: number; rot: Vec3 }>;

    constructor(modelPath: string, placementPath: string, diffuseTexturePath: string, specularTexturePath: string) {
        this.modelPath = modelPath;
        this.placementsPath = placementPath;
        this.diffuseTexturePath = diffuseTexturePath;
        this.specularTexturePath = specularTexturePath;
        this.transforms = new Array<{ pos: Vec3; size: number; rot: Vec3 }>();
    }

    async loadFromFile() {
        const response = await fetch("Assets/placements/" + this.placementsPath);
        if (response.ok) {
            const transforms = await response.text();

            if (transforms != "") {
                for (let t of transforms.split("\n")) {
                    t = t.trim();
                    if (t == "") {
                        break;
                    }
                    let [p, s, r] = t.split("|");
                    let temp = {
                        pos: new Vec3(p.split(",").map((n) => parseFloat(n))),
                        size: parseFloat(s),
                        rot: new Vec3(r.split(",").map((n) => parseFloat(n))),
                    };
                    this.transforms.push(temp);
                }
            }
        }
    }
}

export default class ObjectPlacer {
    private placements: Map<string, Placement>;
	private transformsAdded: boolean;
    private scene: Scene;
    private ecsManager: ECSManager;

    constructor() {
        this.transformsAdded = false;
        this.placements = new Map<string, Placement>();

        this.placements.set("Assets/objs/knight.obj", new Placement("Assets/objs/knight.obj", "TreeTransforms.txt", "Assets/textures/knight.png", "Assets/textures/knight.png"));
        this.placements.set("Assets/objs/house.obj", new Placement("Assets/objs/house.obj", "HouseTransforms.txt", "Assets/textures/houseTex.png", "Assets/textures/houseTex.png"));
    }

    async load(scene: Scene, ecsManager: ECSManager) {
        this.scene = scene;
        this.ecsManager = ecsManager;

        for (let placement of this.placements) {
            await placement[1].loadFromFile();
            
            for (let transform of placement[1].transforms) {
               this.placeObject(placement[0], transform.pos, transform.size, transform.rot, false);
            }
        }
    }

    placeObject(
        type: string,
        position: Vec3,
        size: number,
        rotation: Vec3,
        saveToTransforms: boolean = true
    ): PositionComponent {
        let placement = this.placements.get(type);
        let entity = this.ecsManager.createEntity();
        let mesh = this.scene.getNewMesh(placement.modelPath, placement.diffuseTexturePath, placement.specularTexturePath);

        this.ecsManager.addComponent(entity, new GraphicsComponent(mesh));
        let posComp = new PositionComponent();
        posComp.position.deepAssign(position);
        posComp.scale.deepAssign([size, size, size]);
        posComp.rotation.deepAssign(rotation);
        this.ecsManager.addComponent(entity, posComp);

        if (saveToTransforms) {
            placement.transforms.push({ pos: position, size: size, rot: rotation });
            this.transformsAdded = true;
        }

        // Collision stuff
        let boundingBoxComp = new BoundingBoxComponent();
        boundingBoxComp.setup(mesh.graphicsObject);
        boundingBoxComp.updateTransformMatrix(mesh.modelMatrix);
        this.ecsManager.addComponent(entity, boundingBoxComp);
        let collisionComp = new CollisionComponent();
        collisionComp.isStatic = true;
        this.ecsManager.addComponent(entity, collisionComp);

        // let meshColComp = new MeshCollisionComponent(this.stateAccessible.meshStore.getOctree(objPath));
        // meshColComp.octree.setModelMatrix(mesh.modelMatrix);
        // this.ecsManager.addComponent(entity, meshColComp);

        return posComp;
    }

    downloadTransforms() {
        for (let placement of this.placements) {
            let transformsData = "";

            for (let transform of placement[1].transforms) {
                transformsData +=
                    transform.pos +
                    "|" +
                    transform.size +
                    "|" +
                    transform.rot +
                    "\n";
            }
    
            WebUtils.DownloadFile(placement[1].placementsPath, transformsData);
        }

        this.transformsAdded = false;
	}
    
    onExit(e: BeforeUnloadEvent) {
		if (this.transformsAdded) {
			this.downloadTransforms();

			e.preventDefault();
			e.returnValue = "";
			return;
		}

		delete e["returnValue"];
	}
}
