import TextureStore from "../AssetHandling/TextureStore";
import Camera from "../Camera";
import Scene from "./Scene";
export default class Rendering {
    camera: Camera;
    clearColour: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
    useCrt: boolean;
    useBloom: boolean;
    private textureStore;
    private resolutionWidth;
    private resolutionHeight;
    private particleRenderPass;
    private shadowRenderPass;
    private geometryRenderPass;
    private lightingRenderPass;
    private useSkybox;
    private skyboxRenderPass;
    private crtFramebuffer;
    private crtRenderPass;
    private bloomExtractionInputFramebuffer;
    private bloomRenderPass;
    private finishedFramebuffer;
    private finishedOutputRenderPass;
    private scene;
    constructor(textureStore: TextureStore, scene: Scene);
    initGL(): void;
    reportCanvasResize(x: number, y: number): void;
    setSkybox(path: string): void;
    draw(): void;
}
