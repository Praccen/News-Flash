import Framebuffer from "../../Framebuffer";
import Texture from "../../Textures/Texture";
export default class FinishedOutputRenderPass {
    private screenQuad;
    outputFramebuffer: Framebuffer;
    constructor(inputTextures: Texture[]);
    draw(): void;
}
