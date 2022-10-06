import Rendering from "./Rendering";

export default class State {
    /**
     * Set this to the 0 based index for the state you want the state machine to move to.
     * Leave it at -1 to keep running the current state.
     */
    gotoState: number;

	constructor() {
        this.gotoState = -1;
    }

    async init() {}

	update(dt: number) {}
}
