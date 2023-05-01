import State, { StatesEnum } from "./State";
export default class StateMachine {
    states: Map<StatesEnum, {
        stateType: any;
        minUpdateRate: number;
        state: State;
    }>;
    protected fps: number;
    protected currentState: StatesEnum;
    private firstLoop;
    private lastTick;
    private updateTimer;
    private fpsUpdateTimer;
    private frameCounter;
    private dt;
    constructor(startState: StatesEnum);
    addState(stateEnum: StatesEnum, stateType: any, minUpdateRate: number, state: State): void;
    updateFrameTimers(): void;
    updateState(state: State, minUpdateRate?: number): void;
    runCurrentState(): Promise<void>;
    start(): void;
}
