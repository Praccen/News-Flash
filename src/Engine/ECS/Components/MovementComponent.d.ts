import { Component } from "./Component";
import Vec3 from "../../Maths/Vec3";
export default class MovementComponent extends Component {
    constantAcceleration: Vec3;
    accelerationDirection: Vec3;
    acceleration: number;
    velocity: Vec3;
    drag: number;
    onGround: boolean;
    jumpPower: number;
    jumpRequested: boolean;
    jumpAllowed: boolean;
    constructor();
}
