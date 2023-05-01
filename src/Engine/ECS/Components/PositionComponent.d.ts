import { Component, ComponentTypeEnum } from "./Component";
import Vec3 from "../../Maths/Vec3";
export default class PositionComponent extends Component {
    position: Vec3;
    rotation: Vec3;
    scale: Vec3;
    origin: Vec3;
    matrix: Matrix4;
    constructor(componentType?: ComponentTypeEnum);
    calculateMatrix(matrix: Matrix4): void;
}
