import Vec3 from "../Engine/Maths/Vec3";

export default class DeliveryZone {
    private pos: Vec3;
    private radius: number;

    constructor(positioin: Vec3, radius: number) {
        this.pos = positioin;
        this.radius = radius;
    }

    inZone(pos: Vec3): boolean {
        if (Math.pow(pos.x - this.pos.x, 2) + Math.pow(pos.y - this.pos.y, 2) + Math.pow(pos.z - this.pos.z, 2) < Math.pow(this.radius, 2)) {
            return true
        }
        return false;
    }
}
