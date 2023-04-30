import BoundingBoxComponent from "../Engine/ECS/Components/BoundingBoxComponent.js";
import CollisionComponent from "../Engine/ECS/Components/CollisionComponent.js";
import { ComponentTypeEnum } from "../Engine/ECS/Components/Component.js";
import GraphicsComponent from "../Engine/ECS/Components/GraphicsComponent.js";
import MovementComponent from "../Engine/ECS/Components/MovementComponent.js";
import PositionComponent from "../Engine/ECS/Components/PositionComponent.js";
import ECSManager from "../Engine/ECS/ECSManager.js";
import Entity from "../Engine/ECS/Entity.js";
import Vec3 from "../Engine/Maths/Vec3.js";
import Scene from "../Engine/Rendering/Scene.js";

export default class Newspaper {
	private ecsManager;
	private scene;
	entity: Entity;

	constructor(startingPos: Vec3, startingVel: Vec3, startingRot: Vec3, ecsManager: ECSManager, scene: Scene) {
		this.ecsManager = ecsManager;
		this.scene = scene;
		this.entity = this.ecsManager.createEntity();

		let posComp = new PositionComponent();
		posComp.position = new Vec3(startingPos);
		posComp.rotation = new Vec3(startingRot);
		posComp.scale.setValues(0.2, 0.2, 0.2);
		this.ecsManager.addComponent(this.entity, posComp);

		let moveComp = new MovementComponent();
		moveComp.velocity = startingVel;
		this.ecsManager.addComponent(this.entity, moveComp);

		let paperMesh = this.scene.getNewMesh(
			"Assets/objs/body.obj",
			"Assets/textures/medium_fur.png",
			"Assets/textures/black.png"
		);
		let boundingBoxComp = new BoundingBoxComponent();
		boundingBoxComp.setup(paperMesh.graphicsObject);
		boundingBoxComp.updateTransformMatrix(paperMesh.modelMatrix);
		this.ecsManager.addComponent(this.entity, boundingBoxComp);

		this.ecsManager.addComponent(
			this.entity,
			new GraphicsComponent(paperMesh)
		);
		this.ecsManager.addComponent(this.entity, new CollisionComponent());
	}

	update(dt: number): boolean {
		let moveComp = <MovementComponent>this.entity.getComponent(ComponentTypeEnum.MOVEMENT);
		if ((moveComp.velocity.length2() <= 0.01) && (moveComp.onGround)) {
			this.ecsManager.removeComponent(this.entity, ComponentTypeEnum.MOVEMENT);
			this.ecsManager.removeComponent(this.entity, ComponentTypeEnum.COLLISION);
			this.ecsManager.removeComponent(this.entity, ComponentTypeEnum.BOUNDINGBOX);
			return false;
		} else {
			return true;
		}
	}
}
