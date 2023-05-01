import MeshStore from "../Engine/AssetHandling/MeshStore";
import BoundingBoxComponent from "../Engine/ECS/Components/BoundingBoxComponent";
import CollisionComponent from "../Engine/ECS/Components/CollisionComponent";
import { ComponentTypeEnum } from "../Engine/ECS/Components/Component";
import GraphicsComponent from "../Engine/ECS/Components/GraphicsComponent";
import MeshCollisionComponent from "../Engine/ECS/Components/MeshCollisionComponent";
import PositionComponent from "../Engine/ECS/Components/PositionComponent";
import ECSManager from "../Engine/ECS/ECSManager";
import Entity from "../Engine/ECS/Entity";
import Vec3 from "../Engine/Maths/Vec3";
import { IntersectionTester } from "../Engine/Physics/IntersectionTester";
import Ray from "../Engine/Physics/Shapes/Ray";
import Triangle from "../Engine/Physics/Shapes/Triangle";
import Scene from "../Engine/Rendering/Scene";
import { WebUtils } from "../Engine/Utils/WebUtils";
import DeiliveryZoneComponent from "./ECS/Components/DeliveryZoneComponent";

class Transform {
	pos: Vec3;
	size: number;
	rot: Vec3;
	entity: Entity;

	constructor(pos: Vec3, size: number, rot: Vec3) {
		this.pos = pos;
		this.size = size;
		this.rot = rot;
		this.entity = null;
	}
}

class Placement {
	modelPath: string;
	placementsPath: string;
	diffuseTexturePath: string;
	specularTexturePath: string;
	sizeMultiplier: number;
	addCollision: boolean;
	transforms: Array<Transform>;
	transformAdded: boolean;

	constructor(
		modelPath: string,
		placementPath: string,
		diffuseTexturePath: string,
		specularTexturePath: string,
		addCollision: boolean = true
	) {
		this.modelPath = modelPath;
		this.placementsPath = placementPath;
		this.diffuseTexturePath = diffuseTexturePath;
		this.specularTexturePath = specularTexturePath;
		this.transforms = new Array<Transform>();
		this.addCollision = addCollision;
		this.transformAdded = false;
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
					let temp = new Transform(
						new Vec3(p.split(",").map((n) => parseFloat(n))),
						parseFloat(s),
						new Vec3(r.split(",").map((n) => parseFloat(n))),
					);
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

	private currentlyEditingTransform: Transform;
	private currentlyEditingPlacement: Placement;

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
				"Assets/textures/tree_1.png"
			)
		);
		this.placements.set(
			"Assets/objs/tree_2.obj",
			new Placement(
				"Assets/objs/tree_2.obj",
				"Tree2Transforms.txt",
				"Assets/textures/tree_2.png",
				"Assets/textures/tree_2.png"
			)
		);
		this.placements.set(
			"Assets/objs/tree_3.obj",
			new Placement(
				"Assets/objs/tree_3.obj",
				"Tree3Transforms.txt",
				"Assets/textures/tree_3.png",
				"Assets/textures/tree_3.png"
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
				"Assets/textures/news.png",
				"Assets/textures/news.png",
				false
			)
		);
		this.placements.set(
			"Assets/objs/fence.obj",
			new Placement(
				"Assets/objs/fence.obj",
				"FenceTransforms.txt",
				"Assets/textures/white.png",
				"Assets/textures/white.png"
			)
		);
		this.placements.set(
			"Assets/objs/BigBuske.obj",
			new Placement(
				"Assets/objs/BigBuske.obj",
				"BigBuskeTransforms.txt",
				"Assets/textures/BigBushTexture.png",
				"Assets/textures/BigBushTexture.png"
			)
		);
		this.placements.set(
			"Assets/objs/Solros.obj",
			new Placement(
				"Assets/objs/Solros.obj",
				"SolrosTransforms.txt",
				"Assets/textures/GrassStraw.png",
				"Assets/textures/GrassStraw_Spec.png",
				false
			)
		);
		this.placements.set(
			"Assets/objs/Plant.obj",
			new Placement(
				"Assets/objs/Plant.obj",
				"PlantTransforms.txt",
				"Assets/textures/GrassStraw.png",
				"Assets/textures/GrassStraw_Spec.png",
				false
			)
		);
		this.placements.set(
			"Assets/objs/SmolBuske.obj",
			new Placement(
				"Assets/objs/SmolBuske.obj",
				"SmolBuskeTransforms.txt",
				"Assets/textures/tree_2.png",
				"Assets/textures/tree_2.png"
			)
		);
		this.placements.set(
			"Assets/objs/DeliveryZone.obj",
			new Placement(
				"Assets/objs/DeliveryZone.obj",
				"DeliveryZoneTransforms.txt",
				"Assets/textures/DZ.png",
				"Assets/textures/DZ.png",
				false
			)
		);

		this.currentlyEditingTransform = null;
		this.currentlyEditingPlacement = null;
	}

	async load(scene: Scene, ecsManager: ECSManager) {
		this.scene = scene;
		this.ecsManager = ecsManager;

		for (let placement of this.placements) {
			if (placement[1].transforms.length == 0) {
				await placement[1].loadFromFile();
			}

			for (let transform of placement[1].transforms) {
				let entity = this.placeObject(
					placement[0],
					transform.pos,
					transform.size,
					transform.rot,
					false
				);

				if (entity != undefined) {
					transform.entity = entity;
				}
			}
		}
	}

	placeObject(
		type: string,
		position: Vec3,
		size: number,
		rotation: Vec3,
		saveToTransforms: boolean = true
	): Entity {
		let placement = this.placements.get(type);
		if (placement == undefined) {
			return null;
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
			let length = placement.transforms.push(new Transform(
				position,
				size,
				rotation
			));
			placement.transformAdded = true;
			this.transformsAdded = true;
			placement.transforms[length - 1].entity = entity;

			this.currentlyEditingTransform = placement.transforms[length - 1];
			this.currentlyEditingPlacement = placement;
		}

		if (placement.modelPath == "Assets/objs/DeliveryZone.obj") {
			let zoneComp = new DeiliveryZoneComponent();
			this.ecsManager.addComponent(entity, zoneComp);
		}

		let boundingBoxComp = new BoundingBoxComponent();
		boundingBoxComp.setup(mesh.graphicsObject);
		boundingBoxComp.updateTransformMatrix(mesh.modelMatrix);
		this.ecsManager.addComponent(entity, boundingBoxComp);

		if (!placement.addCollision) {
			return entity;
		}

		// Collision stuff
		let collisionComp = new CollisionComponent();
		collisionComp.isStatic = true;
		this.ecsManager.addComponent(entity, collisionComp);

		let octree = this.meshStore.getOctree(placement.modelPath, false);
		if (octree == undefined) {
			return entity;
		}
		let meshColComp = new MeshCollisionComponent(
			octree
		);
		meshColComp.octree.setModelMatrix(mesh.modelMatrix);
		this.ecsManager.addComponent(entity, meshColComp);

		return entity;
	}

	rayCastToSelectNewObject(ray: Ray) {
		let closest = Infinity;
		for (let placement of this.placements) {
			for (let transform of placement[1].transforms) {
				let bbComp = transform.entity.getComponent(ComponentTypeEnum.BOUNDINGBOX) as BoundingBoxComponent;
				if (bbComp == undefined) {
					continue;
				}

				bbComp.boundingBox.setUpdateNeeded();

				let dist = IntersectionTester.doRayCast(ray, [bbComp.boundingBox], closest); // Ray cast against bounding box, only caring about hits closer than the previous closest
				if (dist > 0 && dist < closest) { // Boundingbox is closer than current closest hit

					// Ray cast against mesh if there is one, only caring about hits closer than the previous closest
					let meshColComp = transform.entity.getComponent(ComponentTypeEnum.MESHCOLLISION) as MeshCollisionComponent;
					if (meshColComp != undefined) {
						// TODO: This is ugly but works
						meshColComp.octree.setModelMatrix(bbComp.boundingBox.getTransformMatrix());
						meshColComp.octree.setModelMatrix();
						let shapeArray = new Array<Triangle>();
						meshColComp.octree.getShapesForRayCast(ray, shapeArray, closest);
						dist = IntersectionTester.doRayCast(ray, shapeArray, closest);
					}
					
					if (dist > 0 && dist < closest) { // Hit is still closer than current closest
						// Update the closest information and save the object for editing
						closest = dist;
						this.currentlyEditingPlacement = placement[1];
						this.currentlyEditingTransform = transform;
					}
				}
				
			}
		}
	}

	updateCurrentlyEditingObject(rotationChange: number, scaleChange: number, newPosition?: Vec3) {
		if (this.currentlyEditingTransform != null) {
			this.currentlyEditingTransform.rot.y += rotationChange;
			this.currentlyEditingTransform.size += scaleChange;
			if (newPosition != undefined) {
				this.currentlyEditingTransform.pos.deepAssign(newPosition);
			}

			let currentlyEditingEntity = this.currentlyEditingTransform.entity;

			if (currentlyEditingEntity != null) {
				let posComp = currentlyEditingEntity.getComponent(
					ComponentTypeEnum.POSITION
				) as PositionComponent;
	
				posComp.rotation.deepAssign(this.currentlyEditingTransform.rot);
				posComp.scale.deepAssign([
					this.currentlyEditingTransform.size,
					this.currentlyEditingTransform.size,
					this.currentlyEditingTransform.size,
				]);
				posComp.position.deepAssign(this.currentlyEditingTransform.pos);
			}
		}

		if (this.currentlyEditingPlacement != null) {
			this.currentlyEditingPlacement.transformAdded = true;
			this.transformsAdded = true;
		}
	}

	downloadTransforms() {
		for (let placement of this.placements) {
			if (!placement[1].transformAdded) {
				continue;
			}

			let transformsData = "";

			for (let transform of placement[1].transforms) {
				transformsData +=
					transform.pos + "|" + transform.size + "|" + transform.rot + "\n";
			}

			WebUtils.DownloadFile(placement[1].placementsPath, transformsData);
			placement[1].transformAdded = false;
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
