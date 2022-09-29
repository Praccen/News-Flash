import System from "./System.js";
import { ComponentTypeEnum } from "../Components/Component.js";
import { IntersectionTester } from "../../Physics/IntersectionTester.js";
import MeshCollisionComponent from "../Components/MeshCollisionComponent.js";
import IntersectionInformation from "../../Physics/IntersectionInformation.js";
import MovementComponent from "../Components/MovementComponent.js";
import PositionComponent from "../Components/PositionComponent.js";
import Vec3 from "../../Maths/Vec3.js";
import { CollisionSolver } from "../../Physics/CollisionSolver.js";
import CollisionComponent from "../Components/CollisionComponent.js";
import BoundingBoxComponent from "../Components/BoundingBoxComponent.js";
import Shape from "../../Physics/Shapes/Shape.js";

export default class CollisionSystem extends System {
	constructor() {
		super([
			ComponentTypeEnum.COLLISION,
			ComponentTypeEnum.BOUNDINGBOX,
			ComponentTypeEnum.POSITION,
		]);
		// Optional MESHCOLLISION, MOVEMENT
	}

	update(dt: number) {
		let information = new Array<IntersectionInformation>();

		for (let e1 of this.entities) {
			let e1CollisionComp = <CollisionComponent>(
				e1.getComponent(ComponentTypeEnum.COLLISION)
			);
			if (e1CollisionComp.isStatic) {
				continue;
			}

			information.length = 0;
			let e1BoundingBoxComp = <BoundingBoxComponent>(
				e1.getComponent(ComponentTypeEnum.BOUNDINGBOX)
			);
			e1BoundingBoxComp.updateTransformMatrix();

			let e1ShapeArray: Array<Shape>;

			let e1MeshCollisionComp = <MeshCollisionComponent>(
				e1.getComponent(ComponentTypeEnum.MESHCOLLISION)
			);
			if (e1MeshCollisionComp) {
				e1ShapeArray = e1MeshCollisionComp.triangles;
				e1MeshCollisionComp.updateTransformMatrix();
			} else {
				e1ShapeArray = new Array<Shape>(e1BoundingBoxComp.boundingBox);
			}

			for (let e2 of this.entities) {
				if (e1.id == e2.id) {
					// Don't collide with self
					continue;
				}

				let e2BoundingBoxComp = <BoundingBoxComponent>(
					e2.getComponent(ComponentTypeEnum.BOUNDINGBOX)
				);
				e2BoundingBoxComp.updateTransformMatrix();

				let e2MeshCollisionComp = <MeshCollisionComponent>(
					e2.getComponent(ComponentTypeEnum.MESHCOLLISION)
				);
				if (e1MeshCollisionComp || e2MeshCollisionComp) {
					// At least one of the entities have mesh collision
					// Start by checking bounding boxes, but don't save information
					if (
						IntersectionTester.identifyIntersection(
							[e1BoundingBoxComp.boundingBox],
							[e2BoundingBoxComp.boundingBox]
						)
					) {
						//  Bounding boxes check
						if (e2MeshCollisionComp) {
							// Entity 2 has mesh collision, use the mesh for intersection testing
							e2MeshCollisionComp.updateTransformMatrix(); // First update transform matrix
							IntersectionTester.identifyIntersectionInformation(
								e1ShapeArray,
								e2MeshCollisionComp.triangles,
								information
							);
						} else {
							// Entity 2 does not have mesh collision, use the bounding box for intersection testing
							IntersectionTester.identifyIntersectionInformation(
								e1ShapeArray,
								[e2BoundingBoxComp.boundingBox],
								information
							);
						}
					}
				} else {
					// None of the entities have mesh collision, do collision with bounding boxes, and save information
					IntersectionTester.identifyIntersectionInformation(
						[e1BoundingBoxComp.boundingBox],
						[e2BoundingBoxComp.boundingBox],
						information
					);
				}
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
