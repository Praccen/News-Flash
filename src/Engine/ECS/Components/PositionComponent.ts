class PositionComponent extends Component {
    position: Vec3;
    rotation: Vec3;
    scale: Vec3;

    constructor(pos?: Vec3) {
        super(ComponentTypeEnum.POSITION);
        if (pos) {
            this.position = new Vec3(pos);
        }
        else {
            this.position = new Vec3();
        }
        this.rotation = new Vec3();
        this.scale = new Vec3({x: 1.0, y: 1.0, z: 1.0});
    }

    calculateMatrix(matrix: Matrix4) {
        matrix.setIdentity();
        matrix.translate(this.position.x, this.position.y, this.position.z);
        if (this.rotation.length2() > 0.0000001) {
            let normRotation = new Vec3(this.rotation);
            normRotation.normalize();
            matrix.rotate(this.rotation.length(), normRotation.x, normRotation.y, normRotation.z);
        }
        matrix.scale(this.scale.x, this.scale.y, this.scale.z);
    }
};