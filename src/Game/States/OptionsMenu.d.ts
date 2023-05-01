import State from "../../Engine/State";
import { StateAccessible } from "../GameMachine";
export default class OptionsMenu extends State {
    private overlayRendering;
    private backButton;
    private crtCB;
    private bloomCB;
    private grassCB;
    private grassDensitySlider;
    private fpsDisplayCB;
    private controlsButton;
    constructor(sa: StateAccessible);
    init(): Promise<void>;
    reset(): void;
    update(dt: number): void;
    draw(): void;
}
