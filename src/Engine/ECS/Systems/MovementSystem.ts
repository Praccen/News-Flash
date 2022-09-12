import System from "./System.js";
import { ComponentTypeEnum } from "../Components/Component.js";
import PositionComponent from "../Components/PositionComponent.js";
import MovementComponent from "../Components/MovementComponent.js";
import Vec3 from "../../Maths/Vec3.js";

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
                new Vec3(movComp.accelerationDirection).multiply(movComp.acceleration).multiply(dt)
            );
            movComp.velocity.add(
                new Vec3(movComp.constantAcceleration).multiply(dt)
            );

            posComp.position.add(new Vec3(movComp.velocity).multiply(dt));

            movComp.accelerationDirection.multiply(0.0);
        }
    }
}
