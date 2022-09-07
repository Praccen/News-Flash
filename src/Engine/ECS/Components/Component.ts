export enum ComponentTypeEnum {
    ANIMATION,
    GRAPHICS,
    MESHCOLLISION,
    MOVEMENT,
    PARTICLESPAWNER,
    POSITION,
}

export class Component {
    private _type: ComponentTypeEnum;

    constructor(type: ComponentTypeEnum) {
        this._type = type;
    }

    get type(): ComponentTypeEnum {
        return this._type;
    }
};