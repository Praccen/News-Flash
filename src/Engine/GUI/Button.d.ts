import Vec2 from "../Maths/Vec2";
import GuiObject from "./GuiObject";
export default class Button extends GuiObject {
    position: Vec2;
    textSize: number;
    private inputNode;
    constructor();
    getElement(): HTMLDivElement;
    getInputElement(): HTMLInputElement;
    onClick(fn: any): void;
    draw(): void;
}
