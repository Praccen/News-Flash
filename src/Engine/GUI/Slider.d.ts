import Vec2 from "../Maths/Vec2";
import GuiObject from "./GuiObject";
export default class Slider extends GuiObject {
    position: Vec2;
    textSize: number;
    private inputNode;
    private label;
    constructor();
    getElement(): HTMLDivElement;
    getInputElement(): HTMLInputElement;
    getValue(): number;
    draw(): void;
}
