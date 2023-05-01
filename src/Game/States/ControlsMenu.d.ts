import State from "../../Engine/State";
import { StateAccessible } from "../GameMachine";
export default class ControlsMenu extends State {
    private overlayRendering;
    private backButton;
    constructor(sa: StateAccessible);
    init(): Promise<void>;
    reset(): void;
    update(dt: number): void;
    draw(): void;
}
