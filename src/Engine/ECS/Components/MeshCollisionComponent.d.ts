import { Component } from "./Component";
import GraphicsObject from "../../Objects/GraphicsObject";
import Octree from "../../Objects/Octree";
export default class MeshCollisionComponent extends Component {
    octree: Octree;
    constructor(octree: Octree, graphicsObject?: GraphicsObject);
    /**
     * Sets up the triangles based on the vertices in a graphics object
     * @param graphicsObj The graphics object
     */
    private setup;
}
