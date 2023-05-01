import Vec3 from "./Vec3";
export default class Matrix3 {
    elements: Array<number>;
    constructor();
    fromMatrix4(mat4: Matrix4): Matrix3;
    toMatrix4(): Matrix4;
    multiplyVec3(vec: Vec3): Vec3;
    transpose(): Matrix3;
    determinant(): number;
    adj(): Matrix3;
    invert(): Matrix3;
}
