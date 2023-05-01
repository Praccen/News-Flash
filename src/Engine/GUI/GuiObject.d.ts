import Vec2 from "../Maths/Vec2";
export default class GuiObject {
    protected position2D: Vec2;
    protected fontSize: number;
    scaleWithWindow: boolean;
    textString: string;
    center: boolean;
    removed: boolean;
    private divContainerElement;
    protected div: HTMLDivElement;
    constructor(cssClass: string);
    getElement(): HTMLDivElement;
    setHidden(hidden: boolean): void;
    remove(): void;
    protected drawObject(): void;
    draw(): void;
}
