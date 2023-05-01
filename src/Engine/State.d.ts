export declare enum StatesEnum {
    STAY = 0,
    LOADINGSCREEN = 1,
    MAINMENU = 2,
    OPTIONS = 3,
    CONTROLS = 4,
    GAME = 5,
    ENDSCREEN = 6,
    DEBUGMODE = 7
}
export default class State {
    gotoState: StatesEnum;
    initialized: boolean;
    constructor();
    init(): Promise<void>;
    reset(): void;
    onExit(e: BeforeUnloadEvent): void;
    update(dt: number): void;
    prepareDraw(dt: number): void;
    draw(): void;
}
