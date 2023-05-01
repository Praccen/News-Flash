import { Component, ComponentTypeEnum } from "../../../Engine/ECS/Components/Component";
import Vec3 from "../../../Engine/Maths/Vec3";
export default class DeiliveryZoneComponent extends Component {
    pos: Vec3;
    radius: number;
    triggerd: boolean;
    constructor(componentType?: ComponentTypeEnum);
}
