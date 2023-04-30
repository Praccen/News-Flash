import System from "./Systems/System";
import CollisionSystem from "./Systems/CollisionSystem";
import MovementSystem from "./Systems/MovementSystem";
import GraphicsSystem from "./Systems/GraphicsSystem";
import ParticleSpawnerSystem from "./Systems/ParticleSpawnerSystem";
import Rendering from "../Rendering/Rendering";
import Entity from "./Entity";
import { Component, ComponentTypeEnum } from "./Components/Component";
import Camera from "../Camera";
import CameraFocusSystem from "./Systems/CameraFocusSystem";
import PositionMatrixUpdateSystem from "./Systems/PositionMatrixUpdateSystem";
import DeliveryZoneSystem from "../../Game/ECS/Systems/DeliveryZoneSystem";

export default class ECSManager {
	private systems: Map<String, System>;
	private entityCounter: number;
	private entities: Array<Entity>;
	private entityAdditionQueue: Array<Entity>;
	private entityDeletionQueue: Array<number>;
	private componentAdditionQueue: Array<{
		entity: Entity;
		component: Component;
	}>;
	private componentRemovalQueue: Array<{
		entity: Entity;
		componentType: ComponentTypeEnum;
	}>;
	camera: Camera;
	rendering: Rendering;

	constructor(rendering: Rendering) {
		this.camera = rendering.camera;
		this.rendering = rendering;

		this.systems = new Map<String, System>();
		this.entityCounter = 0;

		this.entities = new Array<Entity>();
		this.entityAdditionQueue = new Array<Entity>();
		this.entityDeletionQueue = new Array<number>();
		this.componentAdditionQueue = new Array<{
			entity: Entity;
			component: Component;
		}>();
		this.componentRemovalQueue = new Array<{
			entity: Entity;
			componentType: ComponentTypeEnum;
		}>();

		this.initializeSystems();
	}

	initializeSystems() {
		this.systems.set("COLLISION", new CollisionSystem());
		this.systems.set("MOVEMENT", new MovementSystem());
		this.systems.set("POSITIONMATRIXUPDATE", new PositionMatrixUpdateSystem());
		this.systems.set("GRAPHICS", new GraphicsSystem());
		this.systems.set("PARTICLE", new ParticleSpawnerSystem());
		this.systems.set(
			"CAMERAFOCUS",
			new CameraFocusSystem(this.rendering.camera)
		);
		this.systems.set("DELIVERY", new DeliveryZoneSystem());
	}

	update(dt: number) {
		// Add new entities
		this.addQueuedEntities();

		// For all entities, remove/add components
		// Remove/add entities from systems
		this.addQueuedComponents();
		this.removeComponents();
		this.removeEntitiesMarkedForDeletion();

		this.systems.get("MOVEMENT").update(dt);
		this.systems.get("POSITIONMATRIXUPDATE").update(dt);
		this.systems.get("GRAPHICS").update(dt);
		this.systems.get("COLLISION").update(dt);
		this.systems.get("DELIVERY").update(dt);
	}

	updateRenderingSystems(dt: number) {
		this.systems.get("PARTICLE").update(dt);
		this.systems.get("CAMERAFOCUS").update(dt);
	}

	createEntity(): Entity {
		const length = this.entityAdditionQueue.push(
			new Entity(this.entityCounter++)
		);
		return this.entityAdditionQueue[length - 1];
	}

	addComponent(entity: Entity, component: Component) {
		this.componentAdditionQueue.push({ entity, component });
	}

	removeEntity(entityID: number) {
		this.entityDeletionQueue.push(entityID);
	}

	removeComponent(entity: Entity, componentType: ComponentTypeEnum) {
		this.componentRemovalQueue.push({ entity, componentType });
	}

	getEntity(entityID: number): Entity {
		for (const entity of this.entities) {
			if (entity.id == entityID) {
				return entity;
			}
		}
		return null;
	}

	getSystem(type: string): System {
		return this.systems.get(type);
	}

	// Private
	private addQueuedEntities() {
		for (const newEntity of this.entityAdditionQueue) {
			// Add to manager
			const length = this.entities.push(newEntity);

			// Add to systems
			for (let system of this.systems) {
				system[1].addEntity(this.entities[length - 1]);
			}
		}

		// Empty queue
		this.entityAdditionQueue.length = 0;
	}

	private addQueuedComponents() {
		for (const compEntityPair of this.componentAdditionQueue) {
			// If enitity does not already have component, proceed
			if (compEntityPair.entity.addComponent(compEntityPair.component)) {
				for (let system of this.systems) {
					// If entity is not already belonging to the system, try and add it
					if (!system[1].containsEntity(compEntityPair.entity.id)) {
						system[1].addEntity(compEntityPair.entity);
					}
				}
			}
		}

		// Empty queue
		this.componentAdditionQueue.length = 0;
	}

	private removeEntitiesMarkedForDeletion() {
		for (let i of this.entityDeletionQueue) {
			// Delete in systems
			for (let system of this.systems) {
				system[1].removeEntity(i);
			}

			// Delete in manager
			let index = this.entities.findIndex(
				(e) => e.id == this.entityDeletionQueue[i]
			);
			if (index != -1) {
				this.entities.splice(index, 1);
			}
		}

		// Empty queue
		this.entityDeletionQueue.length = 0;
	}

	private removeComponents() {
		for (const compEntityPair of this.componentRemovalQueue) {
			// Remove component from entity
			compEntityPair.entity.removeComponent(compEntityPair.componentType);

			// Remove entity from system if it no longer lives up to the requirements of being in the system
			for (let system of this.systems) {
				system[1].removeFaultyEntity(compEntityPair.entity.id);
			}
		}

		// Empty queue
		this.componentRemovalQueue.length = 0;
	}
}
