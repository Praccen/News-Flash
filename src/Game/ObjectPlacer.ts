import MeshStore from "../Engine/AssetHandling/MeshStore";
import BoundingBoxComponent from "../Engine/ECS/Components/BoundingBoxComponent.js";
import CollisionComponent from "../Engine/ECS/Components/CollisionComponent.js";
import { ComponentTypeEnum } from "../Engine/ECS/Components/Component.js";
import GraphicsComponent from "../Engine/ECS/Components/GraphicsComponent.js";
import MeshCollisionComponent from "../Engine/ECS/Components/MeshCollisionComponent.js";
import PositionComponent from "../Engine/ECS/Components/PositionComponent.js";
import ECSManager from "../Engine/ECS/ECSManager.js";
import Entity from "../Engine/ECS/Entity.js";
import Vec3 from "../Engine/Maths/Vec3.js";
import GraphicsBundle from "../Engine/Objects/GraphicsBundle.js";
import Scene from "../Engine/Rendering/Scene.js";
import { WebUtils } from "../Engine/Utils/WebUtils.js";

class Transform {
	pos: Vec3;
	size: number;
	rot: Vec3;

	constructor(pos: Vec3, size: number, rot: Vec3) {
		this.pos = pos;
		this.size = size;
		this.rot = rot;
	}
}

class Placement {
	modelPath: string;
	placementsPath: string;
	diffuseTexturePath: string;
	specularTexturePath: string;
	sizeMultiplier: number;
	transforms: Array<Transform>;

	constructor(
		modelPath: string,
		placementPath: string,
		diffuseTexturePath: string,
		specularTexturePath: string,
		sizeMultiplier: number = 1
	) {
		this.modelPath = modelPath;
		this.placementsPath = placementPath;
		this.diffuseTexturePath = diffuseTexturePath;
		this.specularTexturePath = specularTexturePath;
		this.sizeMultiplier = sizeMultiplier;
		this.transforms = new Array<Transform>();
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
	private meshStore: MeshStore;

	private lastPlacedTransform: Transform;
	private lastPlacedEntity: Entity;
	private lastPlacedBundle: GraphicsBundle;

	constructor(meshStore: MeshStore) {
		this.meshStore = meshStore;
		this.transformsAdded = false;
		this.placements = new Map<string, Placement>();

		this.placements.set(
			"Assets/objs/mailbox.obj",
			new Placement(
				"Assets/objs/mailbox.obj",
				"MailboxTransforms.txt",
				"Assets/textures/knight.png",
				"Assets/textures/knight.png"
			)
		);
		this.placements.set(
			"Assets/objs/tree_1.obj",
			new Placement(
				"Assets/objs/tree_1.obj",
				"Tree1Transforms.txt",
				"Assets/textures/tree_1.png",
				"Assets/textures/tree_1.png",
				0.4
			)
		);
		this.placements.set(
			"Assets/objs/tree_2.obj",
			new Placement(
				"Assets/objs/tree_2.obj",
				"Tree2Transforms.txt",
				"Assets/textures/tree_2.png",
				"Assets/textures/tree_2.png",
				25.5
			)
		);
		this.placements.set(
			"Assets/objs/tree_3.obj",
			new Placement(
				"Assets/objs/tree_3.obj",
				"Tree3Transforms.txt",
				"Assets/textures/tree_3.png",
				"Assets/textures/tree_3.png",
				4.5
			)
		);

		this.placements.set(
			"Assets/objs/house.obj",
			new Placement(
				"Assets/objs/house.obj",
				"HouseTransforms.txt",
				"Assets/textures/houseTex_bright.png",
				"Assets/textures/houseTex_bright.png"
			)
		);
		this.placements.set(
			"Assets/objs/newspaper.obj",
			new Placement(
				"Assets/objs/newspaper.obj",
				"NewspaperTransforms.txt",
				"Assets/textures/knight.png",
				"Assets/textures/knight.png"
			)
		);
		this.placements.set(
			"Assets/objs/fence.obj",
			new Placement(
				"Assets/objs/fence.obj",
				"FenceTransforms.txt",
				"Assets/textures/knight.png",
				"Assets/textures/knight.png"
			)
		);
		this.placements.set(
			"Assets/objs/BigBuske.obj",
			new Placement(
				"Assets/objs/BigBuske.obj",
				"BigBuskeTransforms.txt",
				"Assets/textures/knight.png",
				"Assets/textures/knight.png"
			)
		);
		this.placements.set(
			"Assets/objs/Solros.obj",
			new Placement(
				"Assets/objs/Solros.obj",
				"SolrosTransforms.txt",
				"Assets/textures/knight.png",
				"Assets/textures/knight.png"
			)
		);
		this.placements.set(
			"Assets/objs/Plant.obj",
			new Placement(
				"Assets/objs/Plant.obj",
				"PlantTransforms.txt",
				"Assets/textures/knight.png",
				"Assets/textures/knight.png"
			)
		);
		this.placements.set(
			"Assets/objs/SmolBuske.obj",
			new Placement(
				"Assets/objs/SmolBuske.obj",
				"SmolBuskeTransforms.txt",
				"Assets/textures/knight.png",
				"Assets/textures/knight.png"
			)
		);





		this.lastPlacedTransform = null;
		this.lastPlacedEntity = null;
	}

	async load(scene: Scene, ecsManager: ECSManager) {
		this.scene = scene;
		this.ecsManager = ecsManager;

		for (let placement of this.placements) {
			if (placement[1].transforms.length == 0) {
				await placement[1].loadFromFile();
			}

			for (let transform of placement[1].transforms) {
				this.placeObject(
					placement[0],
					transform.pos,
					transform.size * placement[1].sizeMultiplier,
					transform.rot,
					false
				);
			}
		}
	}

	placeObject(
		type: string,
		position: Vec3,
		size: number,
		rotation: Vec3,
		saveToTransforms: boolean = true
	) {
		let placement = this.placements.get(type);
		if (placement == undefined) {
			return;
		}
		let entity = this.ecsManager.createEntity();
		let mesh = this.scene.getNewMesh(
			placement.modelPath,
			placement.diffuseTexturePath,
			placement.specularTexturePath
		);

		this.ecsManager.addComponent(entity, new GraphicsComponent(mesh));
		let posComp = new PositionComponent();
		posComp.position.deepAssign(position);
		posComp.scale.deepAssign([size, size, size]);
		posComp.rotation.deepAssign(rotation);
		this.ecsManager.addComponent(entity, posComp);

		if (saveToTransforms) {
			let length = placement.transforms.push({
				pos: position,
				size: size,
				rot: rotation,
			});
			this.transformsAdded = true;

			this.lastPlacedTransform = placement.transforms[length - 1];
			this.lastPlacedEntity = entity;
			this.lastPlacedBundle = mesh;
		}

		// Collision stuff
		let boundingBoxComp = new BoundingBoxComponent();
		boundingBoxComp.setup(mesh.graphicsObject);
		boundingBoxComp.updateTransformMatrix(mesh.modelMatrix);
		this.ecsManager.addComponent(entity, boundingBoxComp);
		let collisionComp = new CollisionComponent();
		collisionComp.isStatic = true;
		this.ecsManager.addComponent(entity, collisionComp);

		let meshColComp = new MeshCollisionComponent(this.meshStore.getOctree(placement.modelPath));
		meshColComp.octree.setModelMatrix(mesh.modelMatrix);
		this.ecsManager.addComponent(entity, meshColComp);
	}

	updateLastPlacedObject(rotationChange: number, scaleChange: number) {
		if (this.lastPlacedTransform != null) {
			this.lastPlacedTransform.rot.y += rotationChange;
			this.lastPlacedTransform.size += scaleChange;
		}

		if (this.lastPlacedEntity != null) {
			let posComp = this.lastPlacedEntity.getComponent(
				ComponentTypeEnum.POSITION
			) as PositionComponent;

			posComp.rotation.deepAssign(this.lastPlacedTransform.rot);
			posComp.scale.deepAssign([
				this.lastPlacedTransform.size,
				this.lastPlacedTransform.size,
				this.lastPlacedTransform.size,
			]);

			let boundingBoxComp = this.lastPlacedEntity.getComponent(
				ComponentTypeEnum.BOUNDINGBOX
			) as BoundingBoxComponent;
			boundingBoxComp.updateTransformMatrix(this.lastPlacedBundle.modelMatrix);
		}
	}

	downloadTransforms() {
		for (let placement of this.placements) {
			let transformsData = "";

			for (let transform of placement[1].transforms) {
				transformsData +=
					transform.pos + "|" + transform.size + "|" + transform.rot + "\n";
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
