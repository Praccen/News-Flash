import GraphicsObject from "../../Objects/GraphicsObject.js";
import { Component, ComponentTypeEnum } from "./Component.js";

export default class GraphicsComponent extends Component {
    object: GraphicsObject; // TODO: Make this take a graphics object instead

    constructor(object: GraphicsObject) {
        super(ComponentTypeEnum.GRAPHICS);
        this.object = object;
    }
};