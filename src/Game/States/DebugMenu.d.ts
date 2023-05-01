import TextObject2D from "../../Engine/GUI/Text/TextObject2D";
import { StateAccessible } from "../GameMachine";
import Game from "./Game";
export default class DebugMenu {
    private overlay;
    private stateAccessible;
    private game;
    private downloadOctreesButton;
    private downloadTransformsButton;
    placementMenuText: TextObject2D;
    actionText: TextObject2D;
    constructor(stateAccessible: StateAccessible, game: Game);
    init(): Promise<void>;
    reset(): void;
    draw(): void;
}
