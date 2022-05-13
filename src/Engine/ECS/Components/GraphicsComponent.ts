class GraphicsComponent extends Component {
    quad: PhongQuad; // TODO: Make this take a graphics object instead

    constructor(quad: PhongQuad) {
        super(ComponentTypeEnum.GRAPHICS);
        this.quad = quad;
    }
};