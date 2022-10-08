export enum ComponentTypeEnum {
	BOUNDINGBOX,
	COLLISION,
	GRAPHICS,
	MESHCOLLISION,
	MOVEMENT,
	PARTICLESPAWNER,
	POINTLIGHT,
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
}
