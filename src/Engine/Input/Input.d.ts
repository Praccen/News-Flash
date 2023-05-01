import Vec2 from "../Maths/Vec2";
export default class Input {
    keys: boolean[];
    buttons: Map<string, boolean>;
    gamepads: Gamepad[];
    mousePosition: {
        x: number;
        y: number;
        previousX: number;
        previousY: number;
    };
    mousePositionOnCanvas: {
        x: number;
        y: number;
        previousX: number;
        previousY: number;
    };
    mouseClicked: boolean;
    simulateTouchBasedOnMouse: boolean;
    touchUsed: boolean;
    joystickLeftDirection: Vec2;
    joystickRightDirection: Vec2;
    repositionTouchControls: boolean;
    private joystickLeftRadius;
    private joystickRightRadius;
    private screenAspectRatio;
    private joystickLeftCenter;
    private joystickLeftBorder;
    private joystickRightCenter;
    private joystickRightBorder;
    private buttonRadius;
    private aButton;
    private bButton;
    private mouseMovementSinceLast;
    constructor();
    handleTouch(touches: any): void;
    getMouseMovement(): Vec2;
    updateGamepad(): void;
    drawTouchControls(): void;
}
