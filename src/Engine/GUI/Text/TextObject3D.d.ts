import Vec3 from "../../Maths/Vec3";
import GuiObject from "../GuiObject";
export default class TextObject3D extends GuiObject {
    position: Vec3;
    size: number;
    scaleFontWithDistance: boolean;
    private textNode;
    constructor();
    draw3D(viewProj: Matrix4): void;
}
