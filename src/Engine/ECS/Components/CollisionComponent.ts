class CollisionComponent extends Component {
    shape: Shape;
    currentCollisionEntities: Set<Entity>;
    isConstraint: boolean;
    effectMovement: boolean;
	allowedClimbing: number;
    bounceFactor: number;
    dragFactor: number;

    constructor(dragFactor: number = 5.0) {
        super(ComponentTypeEnum.COLLISION);

        this.currentCollisionEntities = new Set<Entity>();
        this.isConstraint = false;
        this.effectMovement = true;
        this.allowedClimbing = 0.05;
        this.bounceFactor = 0.0;
        this.dragFactor = dragFactor;

        this.shape = new Shape();
        this.shape.addNormal(new Vec2({x: 1.0, y: 0.0}));
        this.shape.addNormal(new Vec2({x: 0.0, y: 1.0}));

        this.shape.addVertex(new Vec2({x: -0.5, y: 0.5}));
        this.shape.addVertex(new Vec2({x: -0.5, y: -0.5}));
        this.shape.addVertex(new Vec2({x: 0.5, y: -0.5}));
        this.shape.addVertex(new Vec2({x: 0.5, y: 0.5}));
    }
};