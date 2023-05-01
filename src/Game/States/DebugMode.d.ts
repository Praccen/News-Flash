import State from "../../Engine/State";
import { StateAccessible } from "../GameMachine";
import Game from "./Game";
export default class DebugMode extends State {
    private game;
    private stateAccessible;
    private debugMenu;
    private mouseWasPressed;
    private currentlyPlacing;
    private placementOptions;
    private lastMousePos;
    constructor(sa: StateAccessible, game: Game);
    init(): Promise<void>;
    reset(): void;
    update(dt: number): void;
    prepareDraw(dt: number): void;
    draw(): void;
}
