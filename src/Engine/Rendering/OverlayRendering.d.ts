import Camera from "../Camera";
import Button from "../GUI/Button";
import Checkbox from "../GUI/Checkbox";
import Progress from "../GUI/Progress";
import Slider from "../GUI/Slider";
import TextObject2D from "../GUI/Text/TextObject2D";
import TextObject3D from "../GUI/Text/TextObject3D";
export declare class OverlayRendering {
    private camera;
    private guiObjects3D;
    private guiObjects2D;
    constructor(camera?: Camera);
    clear(): void;
    hide(): void;
    show(): void;
    getNew2DText(): TextObject2D;
    getNew3DText(): TextObject3D;
    getNewCheckbox(): Checkbox;
    getNewButton(): Button;
    getNewSlider(): Slider;
    getNewProgress(): Progress;
    draw(): void;
}
