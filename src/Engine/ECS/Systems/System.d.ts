import { ComponentTypeEnum } from "../Components/Component";
import Entity from "../Entity";
export default class System {
    protected entities: Array<Entity>;
    protected requiredComponents: Array<ComponentTypeEnum>;
    constructor(componentTypes: Array<ComponentTypeEnum>);
    entityHasCorrectComponents(entity: Entity): boolean;
    addEntity(entity: Entity): boolean;
    containsEntity(entityId: number): boolean;
    removeFaultyEntity(entityId: number): void;
    removeEntity(entityId: number): void;
    update(dt: number): void;
}
