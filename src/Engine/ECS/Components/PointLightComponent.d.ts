import PointLight from "../../Lighting/PointLight";
import Vec3 from "../../Maths/Vec3";
import { Component } from "./Component";
export default class PointLightComponent extends Component {
    pointLight: PointLight;
    posOffset: Vec3;
    constructor(pointLight: PointLight);
}
