import Vec from "./Vec";
export default class Vec3 extends Vec {
    constructor(base?: number[]);
    get x(): number;
    get y(): number;
    get z(): number;
    set x(x: number);
    set y(y: number);
    set z(z: number);
    setValues(x?: number, y?: number, z?: number): Vec3;
    cross(otherVec: number[]): Vec3;
}
