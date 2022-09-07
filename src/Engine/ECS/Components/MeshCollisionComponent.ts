import { Component , ComponentTypeEnum} from "./Component.js";
import Entity from "../Entity.js";
import Shape from "../../Physics/Shape.js";
import Vec2 from "../../Physics/Vec2.js";
import Triangle3D from "../../Physics/Triangle3D.js";
import Mesh from "../../Objects/Mesh.js";

export default class MeshCollisionComponent extends Component {
    triangles: Array<Triangle3D>;
    isStatic: boolean;

    constructor(mesh: Mesh) {
        super(ComponentTypeEnum.MESHCOLLISION);

        this.isStatic = false;

        this.triangles = new Array<Triangle3D>();
        mesh.setupShapes(this.triangles);
    }
};