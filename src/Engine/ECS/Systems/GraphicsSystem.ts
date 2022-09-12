import System from "./System.js";
import GraphicsComponent from "../Components/GraphicsComponent.js";
import { ComponentTypeEnum } from "../Components/Component.js";
import PositionComponent from "../Components/PositionComponent.js";
import MeshCollisionComponent from "../Components/MeshCollisionComponent.js";

export default class GraphicsSystem extends System {
    
    constructor() {
        super([ComponentTypeEnum.GRAPHICS, ComponentTypeEnum.POSITION]);
    }

    update(dt: number) {
        for (const e of this.entities) {
            let graphComp = <GraphicsComponent> e.getComponent(ComponentTypeEnum.GRAPHICS);
            let posComp = <PositionComponent> e.getComponent(ComponentTypeEnum.POSITION);

            if (graphComp && posComp) {
                posComp.calculateMatrix(graphComp.object.modelMatrix);
            }
        }
    }
};