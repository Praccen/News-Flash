export declare enum ComponentTypeEnum {
    BOUNDINGBOX = 0,
    CAMERAFOCUS = 1,
    COLLISION = 2,
    GRAPHICS = 3,
    MESHCOLLISION = 4,
    MOVEMENT = 5,
    PARTICLESPAWNER = 6,
    POINTLIGHT = 7,
    POSITION = 8,
    POSITIONPARENT = 9,
    DELIVERYZONE = 10
}
export declare class Component {
    private _type;
    constructor(type: ComponentTypeEnum);
    get type(): ComponentTypeEnum;
}
