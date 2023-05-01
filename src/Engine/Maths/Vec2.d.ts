import Vec from "./Vec";
export default class Vec2 extends Vec {
    constructor(base?: number[]);
    get x(): number;
    get y(): number;
    set x(x: number);
    set y(y: number);
    setValues(x?: number, y?: number): Vec2;
}
