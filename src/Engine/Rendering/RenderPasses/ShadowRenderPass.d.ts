import Framebuffer from "../../Framebuffer";
import Scene from "../Scene";
import Camera from "../../Camera";
export default class ShadowRenderPass {
    private shadowResolution;
    private shadowOffset;
    shadowBuffer: Framebuffer;
    constructor();
    setShadowMappingResolution(res: number): void;
    draw(scene: Scene, camera: Camera): void;
}
