class MovementComponent extends Component {
    constantAcceleration: Vec3;
    accelerationDirection: Vec3;
    acceleration: number ;
    velocity: Vec3;
    maxVelocity: Vec3;
    minVelocity: Vec3;
    jumpPower: number;
    jumpAllowed: boolean;
    jumpRequested: boolean;
    drag: number;
    defaultDrag: number;

    constructor() {
        super(ComponentTypeEnum.MOVEMENT);
        this.constantAcceleration = new Vec3({x: 0.0, y: -9.8, z: 0.0});
        this.accelerationDirection = new Vec3();
        this.acceleration = 6.0;
        this.velocity = new Vec3();
        this.maxVelocity = new Vec3({x: 3.0, y: 100.0, z: 0.0 });
        this.minVelocity = new Vec3({x: -3.0, y: -100.0, z:0.0 });
        this.jumpPower = 6.0;
        this.jumpAllowed = true;
        this.jumpRequested = false;
        this.defaultDrag = 1.0;
        this.drag = this.defaultDrag;
    }
}
