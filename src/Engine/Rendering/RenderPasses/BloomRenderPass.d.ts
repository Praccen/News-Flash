import Framebuffer from "../../Framebuffer";
import Texture from "../../Textures/Texture";
export default class BloomRenderPass {
    private bloomResolutionWidth;
    private bloomResolutionHeight;
    private bloomExtractionOutputFramebuffer;
    private pingPongFramebuffers;
    private screenQuad;
    outputFramebuffer: Framebuffer;
    constructor(inputTextures: Texture[]);
    setResolution(x: number, y: number): void;
    private bindFramebuffers;
    draw(): void;
}
