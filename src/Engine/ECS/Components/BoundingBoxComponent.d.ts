import GraphicsObject from "../../Objects/GraphicsObject";
import OBB from "../../Physics/Shapes/OBB";
import { Component } from "./Component";
export default class BoundingBoxComponent extends Component {
    boundingBox: OBB;
    constructor();
    /**
     * Sets up the bounding box based on the vertices in a graphics object
     * @param graphicsObj The graphics object
     */
    setup(graphicsObj: GraphicsObject): void;
    /**
     * Update the transform matrix used for the bounding box
     * @param matrix Optional: Will set a new matrix to use for the bounding box. If no matrix is sent, it will use the previously set matrix but mark the box to be updated.
     */
    updateTransformMatrix(matrix?: Matrix4): void;
}
