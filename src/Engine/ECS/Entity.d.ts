import { Component, ComponentTypeEnum } from "./Components/Component";
export default class Entity {
    readonly id: number;
    private name;
    private components;
    constructor(id: number);
    addComponent(component: Component): boolean;
    hasComponent(type: ComponentTypeEnum): boolean;
    removeComponent(type: ComponentTypeEnum): void;
    getComponent(type: ComponentTypeEnum): Component;
}
