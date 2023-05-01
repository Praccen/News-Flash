import Texture from "./Textures/Texture";
export default class Framebuffer {
    textures: Array<Texture>;
    depthTexture: Texture;
    protected rbo: WebGLRenderbuffer;
    protected fbo: WebGLFramebuffer;
    protected width: number;
    protected height: number;
    /**
     *
     * @param width - width of framebuffer textures
     * @param height - height of framebuffer textures
     * @param textures - colour attachment textures, send empty array if no colour attachments should be used
     * @param depthTexture - depth attachment texture, send null if no depth attachment (an rbo will be created instead)
     */
    constructor(width: number, height: number, textures: Array<Texture>, depthTexture: Texture);
    protected setupAttachments(): void;
    setProportions(width: number, height: number): void;
    bind(target: number): void;
}
