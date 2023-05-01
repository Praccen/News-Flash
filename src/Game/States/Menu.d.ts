import State from "../../Engine/State";
import { StateAccessible } from "../GameMachine";
export default class Menu extends State {
    private overlayRendering;
    constructor(sa: StateAccessible);
    init(): Promise<void>;
    reset(): void;
    update(dt: number): void;
    draw(): void;
}
