class MovementSystem extends System {
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

            // Do movement calculations and set positions accordingly
            movComp.velocity.add(
                new Vec3(movComp.accelerationDirection).multiply(movComp.acceleration).multiply(dt)
            );
            movComp.velocity.add(
                new Vec3(movComp.constantAcceleration).multiply(dt)
            );
            if (movComp.jumpRequested && movComp.jumpAllowed) {
                movComp.velocity.y = movComp.jumpPower;
                movComp.jumpAllowed = false;
            }

            movComp.velocity.min(movComp.maxVelocity);
            movComp.velocity.max(movComp.minVelocity);

            //Drag
            if (movComp.velocity.x > 0.0 || movComp.velocity.x < 0.0) {
                movComp.velocity.x -=
                    movComp.velocity.x *
                    (1.0 - movComp.accelerationDirection.x * movComp.velocity.x) * movComp.drag * dt;
            }

            //stop if velocity is too slow
            const accelerating = movComp.accelerationDirection.length2() > 0.0;
            if (!accelerating && movComp.velocity.x < 0.01 && movComp.velocity.x > -0.01) {
                movComp.velocity.x = 0.0;
            }

            posComp.position.add(new Vec3(movComp.velocity).multiply(dt));

            movComp.accelerationDirection.multiply(0.0);

            movComp.jumpRequested = false;
        }
    }
}
