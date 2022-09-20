import System from "./System.js";
import { ComponentTypeEnum } from "../Components/Component.js";
import { IntersectionTester } from "../../Physics/IntersectionTester.js";
import MeshCollisionComponent from "../Components/MeshCollisionComponent.js";
import IntersectionInformation from "../../Physics/IntersectionInformation.js";
import MovementComponent from "../Components/MovementComponent.js";
import PositionComponent from "../Components/PositionComponent.js";
import Vec3 from "../../Maths/Vec3.js";
import { CollisionSolver } from "../../Physics/CollisionSolver.js";

export default class CollisionSystem extends System {
	constructor() {
		super([ComponentTypeEnum.MESHCOLLISION, ComponentTypeEnum.POSITION]);
	}

	update(dt: number) {
		let information = new Array<IntersectionInformation>();
		for (let e1 of this.entities) {
			information.length = 0;
			let e1CollisionComp = <MeshCollisionComponent>(
				e1.getComponent(ComponentTypeEnum.MESHCOLLISION)
			);
			e1CollisionComp.updateTransformMatrix();
			if (e1CollisionComp.isStatic) {
				continue;
			}
			for (let e2 of this.entities) {
				if (e1.id == e2.id) {
					// Don't collide with self
					continue;
				}

				let e2CollisionComp = <MeshCollisionComponent>(
					e2.getComponent(ComponentTypeEnum.MESHCOLLISION)
				);

				e2CollisionComp.updateTransformMatrix();

				IntersectionTester.identifyMeshVsMeshWithInformation(
					e1CollisionComp.triangles,
					e2CollisionComp.triangles,
					information
				);
			}

			let movComp = <MovementComponent>(
				e1.getComponent(ComponentTypeEnum.MOVEMENT)
			);
			let posComp = <PositionComponent>(
				e1.getComponent(ComponentTypeEnum.POSITION)
			);

			// Update velocities
			if (movComp) {
				for (let inf of information) {
					let dotProd = movComp.velocity.dot(inf.axis);
					if (dotProd < 0.0) {
						movComp.velocity.subtract(new Vec3(inf.axis).multiply(dotProd));
					}
				}
			}

			let displacement = CollisionSolver.getTranslationNeeded(information);
			posComp.position.add(displacement);
		}
	}
}
