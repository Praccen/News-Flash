import State from "../../Engine/State";
import { StateAccessible } from "../GameMachine";
export default class EndScreen extends State {
    private game;
    private overlayRendering;
    private endText;
    private scoreText;
    private scoreTextNumber;
    constructor(sa: StateAccessible);
    init(): Promise<void>;
    reset(): void;
    update(dt: number): void;
    draw(): void;
}
