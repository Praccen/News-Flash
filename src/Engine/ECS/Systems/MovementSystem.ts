import System from "./System.js";
import { ComponentTypeEnum } from "../Components/Component.js";
import PositionComponent from "../Components/PositionComponent.js";
import MovementComponent from "../Components/MovementComponent.js";
import Vec3 from "../../Physics/Vec3.js";

export default class MovementSystem extends System {
	constructor() {
		super([ComponentTypeEnum.POSITION, ComponentTypeEnum.MOVEMENT]);
	}

	update(dt: number) {
		for (const e of this.entities) {
			let posComp = <PositionComponent>(
				e.getComponent(ComponentTypeEnum.POSITION)
			);
			let movComp = <MovementComponent>(
				e.getComponent(ComponentTypeEnum.MOVEMENT)
			);

			// Do movement calculations
			movComp.velocity.add(
				new Vec3(movComp.accelerationDirection)
					.multiply(movComp.acceleration)
					.multiply(dt)
			);
			movComp.velocity.add(new Vec3(movComp.constantAcceleration).multiply(dt));
			if (movComp.jumpRequested && movComp.jumpAllowed) {
				movComp.velocity.y = movComp.jumpPower;
				movComp.jumpAllowed = false;
			}

			// Drag
			let xzVelocity = new Vec3(movComp.velocity);
			xzVelocity.y = 0.0;
			let xzSpeed2 = xzVelocity.length2();
			if (xzSpeed2 > 0.0001) {
				let xzSpeed = Math.sqrt(xzSpeed2);
				xzSpeed = Math.max(xzSpeed - movComp.drag * dt, 0.0);
				xzVelocity.normalize().multiply(xzSpeed);
			}

			// Stop if velocity is close to zero
			if (
				xzVelocity.length2() < 0.0001 &&
				movComp.accelerationDirection.length2() < 0.0001
			) {
				xzVelocity.setValues(0.0, 0.0, 0.0);
			}

			// Limit velocity using the maxVelocity
			if (xzVelocity.length2() > Math.pow(movComp.maxVelocity.x, 2)) {
				xzVelocity.normalize().multiply(movComp.maxVelocity.x);
			}
			movComp.velocity.y = Math.max(
				Math.min(movComp.maxVelocity.y, movComp.velocity.y),
				-movComp.maxVelocity.y
			);

			movComp.velocity.x = xzVelocity.x;
			movComp.velocity.z = xzVelocity.z;

			posComp.position.add(new Vec3(movComp.velocity).multiply(dt));

			movComp.accelerationDirection.multiply(0.0);

			movComp.jumpRequested = false;
		}
	}
}
