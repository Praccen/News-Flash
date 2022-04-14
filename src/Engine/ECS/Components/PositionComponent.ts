class PositionComponent extends Component {
    position: Vec3;
    rotation: number;
    scale: Vec3;

    constructor(pos?: Vec3) {
        super(ComponentTypeEnum.POSITION);
        if (pos) {
            this.position = new Vec3(pos);
        }
        else {
            this.position = new Vec3();
        }
        this.rotation = 0.0;
        this.scale = new Vec3();
        this.scale.x = 1.0;
        this.scale.y = 1.0;
        this.scale.z = 1.0;
    }

    calculateMatrix(matrix: Matrix4) {
        matrix.setIdentity();
        matrix.translate(this.position.x, this.position.y, this.position.z);
        matrix.rotate(this.rotation, 0.0, 0.0, 1.0);
        matrix.scale(this.scale.x, this.scale.y, this.scale.z);
    }
};