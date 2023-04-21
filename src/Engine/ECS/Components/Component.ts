export enum ComponentTypeEnum {
	BOUNDINGBOX,
	CAMERAFOCUS,
	COLLISION,
	GRAPHICS,
	MESHCOLLISION,
	MOVEMENT,
	PARTICLESPAWNER,
	POINTLIGHT,
	POSITION,
	POSITIONPARENT
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
