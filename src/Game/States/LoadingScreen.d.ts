import State from "../../Engine/State";
import { StateAccessible } from "../GameMachine";
export default class LoadingScreen extends State {
    private overlayRendering;
    private sa;
    private text;
    private statusText;
    private progressBar;
    private progress;
    private timer;
    private texturesToLoad;
    private meshesRequested;
    private meshesLoaded;
    private heightmapsRequested;
    private heightmapsLoaded;
    private octreesToLoad;
    private octreesRequested;
    private octreesLoaded;
    constructor(sa: StateAccessible);
    init(): Promise<void>;
    reset(): void;
    update(dt: number): void;
    draw(): void;
}
