import GuiObject from "./GuiObject";
import Vec2 from "../Maths/Vec2";
export default class Progress extends GuiObject {
    position: Vec2;
    size: number;
    private progressNode;
    constructor();
    getProgressElement(): HTMLProgressElement;
    draw(): void;
}
