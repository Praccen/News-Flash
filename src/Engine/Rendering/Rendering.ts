import { gl, windowInfo } from "../../main.js";
import { options } from "../../Game/GameMachine.js";
import Framebuffer from "../Framebuffer.js";
import Texture from "../Textures/Texture.js";
import TextureStore from "../AssetHandling/TextureStore.js";
import Camera from "../Camera.js";
import Scene from "./Scene.js";
import ShadowRenderPass from "./RenderPasses/ShadowRenderPass.js";
import CRTRenderPass from "./RenderPasses/CRTRenderPass.js";
import BloomRenderPass from "./RenderPasses/BloomRenderPass.js";
import SkyboxRenderPass from "./RenderPasses/SkyboxRenderPass.js";
import GeometryRenderPass from "./RenderPasses/GeometryRenderPass.js";
import LightingRenderPass from "./RenderPasses/LightingRenderPass.js";
import ParticleRenderPass from "./RenderPasses/ParticleRenderPass.js";

export default class Rendering {
	// public
	camera: Camera;
	clearColour: { r: number; g: number; b: number; a: number };

	// ---- Post processing toggles ----
	useCrt: boolean;
	useBloom: boolean;
	// ---------------------------------

	// private
	private textureStore: TextureStore;
	private resolutionWidth: number;
	private resolutionHeight: number;

	// ---- Particles ----
	private particleRenderPass: ParticleRenderPass;
	// -------------------

	// ---- Shadows ----
	private shadowRenderPass: ShadowRenderPass;
	// -----------------

	// ---- Deferred rendering ----
	private geometryRenderPass: GeometryRenderPass;
	private lightingRenderPass: LightingRenderPass;
	// ----------------------------

	// ---- Skybox ----
	private useSkybox: boolean;
	private skyboxRenderPass: SkyboxRenderPass;
	// ----------------

	// ---- Post processing ----
	// Crt effect
	private crtFramebuffer: Framebuffer;
	private crtRenderPass: CRTRenderPass;

	// Bloom
	private bloomExtractionInputFramebuffer: Framebuffer;
	private bloomRenderPass: BloomRenderPass;
	// -------------------------

	private scene: Scene;

	constructor(textureStore: TextureStore, scene: Scene) {
		this.textureStore = textureStore;
		this.scene = scene;

		this.shadowRenderPass = new ShadowRenderPass();

		this.camera = new Camera(gl);
		this.resolutionWidth = windowInfo.resolutionWidth;
		this.resolutionHeight = windowInfo.resolutionHeight;

		// ---- Deferred rendering ----
		this.geometryRenderPass = new GeometryRenderPass();

		let textureArray = new Array<Texture>();
		for (
			let i = 0;
			i < this.geometryRenderPass.outputFramebuffer.textures.length;
			i++
		) {
			textureArray.push(this.geometryRenderPass.outputFramebuffer.textures[i]);
		}
		textureArray.push(this.shadowRenderPass.shadowBuffer.depthTexture);
		this.lightingRenderPass = new LightingRenderPass(textureArray);
		// ----------------------------

		// ---- Particles ----
		this.particleRenderPass = new ParticleRenderPass();
		// -------------------

		// ---- Skybox ----
		this.useSkybox = false;
		this.skyboxRenderPass = new SkyboxRenderPass();
		// ----------------

		// ---- Post processing ----
		// Crt effect
		this.useCrt = options.useCrt;
		this.crtFramebuffer = new Framebuffer(
			this.resolutionWidth,
			this.resolutionHeight,
			[new Texture(false)],
			null
		);

		this.crtRenderPass = new CRTRenderPass(this.crtFramebuffer.textures);

		// Bloom
		this.bloomExtractionInputFramebuffer = new Framebuffer(
			windowInfo.resolutionWidth,
			windowInfo.resolutionHeight,
			[new Texture(false)],
			null
		);
		this.bloomRenderPass = new BloomRenderPass(
			this.bloomExtractionInputFramebuffer.textures
		);
		this.useBloom = options.useBloom;
		// -------------------------

		this.initGL();
	}

	initGL() {
		this.clearColour = { r: 0.15, g: 0.1, b: 0.1, a: 1.0 };
		gl.clearColor(
			this.clearColour.r,
			this.clearColour.g,
			this.clearColour.b,
			this.clearColour.a
		);

		// Enable depth test
		gl.enable(gl.DEPTH_TEST);

		//Enable alpha blending
		// gl.enable(gl.BLEND);
		// gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.disable(gl.BLEND);

		// Disable faceculling
		gl.cullFace(gl.BACK);
		gl.disable(gl.CULL_FACE);
	}

	reportCanvasResize(x: number, y: number) {
		this.resolutionWidth = x;
		this.resolutionHeight = y;
		this.geometryRenderPass.setResolution(x, y);
		this.crtFramebuffer.setProportions(x, y);

		this.bloomExtractionInputFramebuffer.setProportions(x, y);
		this.bloomRenderPass.setResolution(x, y);
	}

	setSkybox(path: string) {
		this.skyboxRenderPass.setSkybox(this.textureStore.getCubeMap(path));
		this.useSkybox = true;
	}

	draw() {
		if (
			this.resolutionWidth != windowInfo.resolutionWidth ||
			this.resolutionHeight != windowInfo.resolutionHeight
		) {
			this.reportCanvasResize(
				windowInfo.resolutionWidth,
				windowInfo.resolutionHeight
			);
		}

		gl.enable(gl.DEPTH_TEST);

		// ---- Shadow pass ----
		this.shadowRenderPass.draw(this.scene, this.camera);
		// ---------------------

		// ---- Geometry pass ----
		this.geometryRenderPass.draw(this.scene, this.camera);
		// -----------------------

		// Geometry pass over, appropriate framebuffer for post processing or render directly to screen.
		if (this.useBloom) {
			this.bloomExtractionInputFramebuffer.bind(gl.DRAW_FRAMEBUFFER);
		} else if (this.useCrt) {
			this.crtFramebuffer.bind(gl.DRAW_FRAMEBUFFER);
		} else {
			gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null); // Render directly to screen
		}

		// Clear the output with the actual clear colour we have set
		gl.clearColor(
			this.clearColour.r,
			this.clearColour.g,
			this.clearColour.b,
			this.clearColour.a
		);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

		// ---- Lighting pass ----
		this.lightingRenderPass.draw(this.scene, this.camera);
		// -----------------------

		// Copy the depth buffer information from the gBuffer to the current depth buffer
		this.geometryRenderPass.outputFramebuffer.bind(gl.READ_FRAMEBUFFER);
		gl.blitFramebuffer(
			0,
			0,
			this.resolutionWidth,
			this.resolutionHeight,
			0,
			0,
			this.resolutionWidth,
			this.resolutionHeight,
			gl.DEPTH_BUFFER_BIT,
			gl.NEAREST
		);

		// ---- Particles ----
		this.particleRenderPass.draw(this.scene, this.camera);
		// -------------------

		// ---- Skybox ----
		if (this.useSkybox) {
			this.skyboxRenderPass.draw(this.camera);
		}
		// ----------------

		// ---- Post processing ----
		if (this.useBloom) {
			if (this.useCrt) {
				this.bloomRenderPass.outputFramebuffer = this.crtFramebuffer;
			} else {
				this.bloomRenderPass.outputFramebuffer = null;
			}
			this.bloomRenderPass.draw();
		}

		if (this.useCrt) {
			this.crtRenderPass.draw();
		}
		// -------------------------
	}
}
