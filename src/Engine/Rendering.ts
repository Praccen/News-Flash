import { gl, applicationStartTime, windowInfo} from "../main.js";
import { options } from "../Game/GameMachine.js";
import Framebuffer from "./Framebuffer.js";
import ScreenQuad from "./Objects/ScreenQuad.js";
import Quad from "./Objects/Quad.js";
import PhongQuad from "./Objects/PhongQuad.js";
import Mesh from "./Objects/Mesh.js";
import ParticleSpawner from "./Objects/ParticleSpawner.js";
import Texture from "./Textures/Texture.js";
import TextureStore from "./Textures/TextureStore.js";
import Camera from "./Camera.js";
import DirectionalLight from "./Lighting/DirectionalLight.js";
import PointLight from "./Lighting/PointLight.js";
import TextObject2D from "./GUI/Text/TextObject2D.js";
import TextObject3D from "./GUI/Text/TextObject3D.js";
import Checkbox from "./GUI/Checkbox.js";
import Button from "./GUI/Button.js";
import SimpleShaderProgram from "./ShaderPrograms/SimpleShaderProgram.js";
import ScreenQuadShaderProgram from "./ShaderPrograms/ScreenQuadShaderProgram.js";
import CrtShaderProgram from "./ShaderPrograms/PostProcessing/CrtShaderProgram.js";
import ParticleShaderProgram from "./ShaderPrograms/ParticleShaderProgram.js";
import ShadowPass from "./ShaderPrograms/ShadowMapping/ShadowPass.js";
import GeometryPass from "./ShaderPrograms/DeferredRendering/GeometryPass.js";
import LightingPass from "./ShaderPrograms/DeferredRendering/LightingPass.js";
import BloomExtraction from "./ShaderPrograms/PostProcessing/BloomExtraction.js";
import BloomBlending from "./ShaderPrograms/PostProcessing/BloomBlending.js";
import GaussianBlur from "./ShaderPrograms/PostProcessing/GaussianBlur.js";
import GraphicsObject from "./Objects/GraphicsObject.js";
import Slider from "./GUI/Slider.js";
import GuiObject from "./GUI/GuiObject.js";
import Progress from "./GUI/Progress.js";

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
	private bloomResolutionWidth: number;
	private bloomResolutionHeight: number;

	// ---- Simple shading ----
	private simpleShaderProgram: SimpleShaderProgram;
	// ------------------------

	// ---- Particles ----
	private particleShaderProgram: ParticleShaderProgram;
	private particleSpawners: Array<ParticleSpawner>;
	// -------------------

	// ---- Shadow mapping ----
	private shadowResolution: number;
	private shadowOffset: number;
	private shadowPass: ShadowPass;
	private shadowBuffer: Framebuffer;
	// ------------------------

	// ---- Deferred rendering ----
	private geometryPass: GeometryPass;
	private lightingPass: LightingPass;
	private gBuffer: Framebuffer;
	private lightingQuad: ScreenQuad;
	// ----------------------------

	// ---- Post processing ----
	// Crt effect
	private crtShaderProgram: CrtShaderProgram;
	private crtFramebuffer: Framebuffer;

	// Bloom
	private bloomExtraction: BloomExtraction;
	private bloomExtractionInputFramebuffer: Framebuffer;
	private bloomExtractionOutputFramebuffer: Framebuffer;
	private gaussianBlur: GaussianBlur;
	private pingPongFramebuffers: Array<Framebuffer>; // 2 frambuffers to go back and fourth between
	private bloomBlending: BloomBlending;

	// Screen quad to output the finished image on
	private screenQuadShaderProgram: ScreenQuadShaderProgram;
	private screenQuad: ScreenQuad;
	// -------------------------

	// ---- Graphics objects ----
	private quads: Array<Quad>;
	private graphicObjects: Array<GraphicsObject>;
	// --------------------------

	// ---- Lights ----
	private directionalLight: DirectionalLight;
	private pointLights: Array<PointLight>;
	// ----------------

	// ---- GUI rendering ----
	private guiObjects3D: Array<TextObject3D>;
	private guiObjects2D: Array<GuiObject>;
	// -----------------------

	constructor() {
		this.textureStore = new TextureStore();
		this.camera = new Camera(gl);
		this.resolutionWidth = windowInfo.resolutionWidth;
		this.resolutionHeight = windowInfo.resolutionHeight;

		// ---- Simple shading ----
		this.simpleShaderProgram = new SimpleShaderProgram(gl);
		// ------------------------

		// ---- Particles ----
		this.particleShaderProgram = new ParticleShaderProgram(gl);
		this.particleSpawners = new Array<ParticleSpawner>();
		// -------------------

		// ---- Shadow mapping ----
		this.shadowResolution = 4096;
		this.shadowOffset = 20.0;
		this.shadowPass = new ShadowPass(gl);
		this.shadowBuffer = new Framebuffer(
			this.shadowResolution,
			this.shadowResolution,
			true,
			[]
		); // [{internalFormat: gl.RGBA, dataStorageType: gl.UNSIGNED_BYTE}]
		// ------------------------

		// ---- Deferred rendering ----
		this.geometryPass = new GeometryPass(gl);
		this.lightingPass = new LightingPass(gl);
		this.gBuffer = new Framebuffer(
			this.resolutionWidth,
			this.resolutionHeight,
			false,
			[
				{ internalFormat: gl.RGBA32F, dataStorageType: gl.FLOAT },
				{ internalFormat: gl.RGBA32F, dataStorageType: gl.FLOAT },
				{
					internalFormat: gl.RGBA,
					dataStorageType: gl.UNSIGNED_BYTE,
				},
			]
		);

		let textureArray = new Array<Texture>();
		for (let i = 0; i < this.gBuffer.textures.length; i++) {
			textureArray.push(this.gBuffer.textures[i]);
		}
		textureArray.push(this.shadowBuffer.depthTexture);
		this.lightingQuad = new ScreenQuad(
			gl,
			this.lightingPass,
			textureArray
		);
		// ----------------------------

		// ---- Post processing ----
		// Crt effect
		this.useCrt = options.useCrt;
		this.crtShaderProgram = new CrtShaderProgram(gl);
		this.crtFramebuffer = new Framebuffer(
			this.resolutionWidth,
			this.resolutionHeight,
			false,
			[{ internalFormat: gl.RGBA, dataStorageType: gl.UNSIGNED_BYTE }]
		);

		// Bloom
		this.useBloom = options.useBloom;
		this.bloomExtraction = new BloomExtraction(gl);
		this.bloomExtractionInputFramebuffer = new Framebuffer(
			this.resolutionWidth,
			this.resolutionHeight,
			false,
			[{ internalFormat: gl.RGBA, dataStorageType: gl.UNSIGNED_BYTE }]
		);
		this.bloomExtractionOutputFramebuffer = new Framebuffer(
			this.resolutionWidth,
			this.resolutionHeight,
			false,
			[
				{
					internalFormat: gl.RGBA,
					dataStorageType: gl.UNSIGNED_BYTE,
				},
				{
					internalFormat: gl.RGBA,
					dataStorageType: gl.UNSIGNED_BYTE,
				},
			]
		);
		this.gaussianBlur = new GaussianBlur(gl);
		this.pingPongFramebuffers = new Array<Framebuffer>(2);
		this.bloomResolutionWidth = 1280;
		this.bloomResolutionHeight = 720;
		for (let i = 0; i < 2; i++) {
			this.pingPongFramebuffers[i] = new Framebuffer(
				this.bloomResolutionWidth,
				this.bloomResolutionHeight,
				false,
				[
					{
						internalFormat: gl.RGBA,
						dataStorageType: gl.UNSIGNED_BYTE,
					},
				]
			);
		}
		this.bloomBlending = new BloomBlending(gl);

		// Screen quad to output the finished image on
		this.screenQuadShaderProgram = new ScreenQuadShaderProgram(gl);
		this.screenQuad = new ScreenQuad(
			gl,
			this.screenQuadShaderProgram,
			new Array<Texture>()
		);
		// -------------------------

		// ---- Graphics objects ----
		this.quads = new Array<Quad>();
		this.graphicObjects = new Array<GraphicsObject>();
		// --------------------------

		// ---- Lights ----
		this.directionalLight = new DirectionalLight(gl, this.lightingPass);
		this.pointLights = new Array<PointLight>();
		// ----------------

		// ---- GUI rendering ----
		this.guiObjects3D = new Array<TextObject3D>();
		this.guiObjects2D = new Array<GuiObject>();
		// -----------------------

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
		gl.disable(gl.CULL_FACE);
	}

	clear() {
		for (let guiObject2D of this.guiObjects2D) {
			guiObject2D.remove();
		}

		for (let guiObject3D of this.guiObjects3D) {
			guiObject3D.remove();
		}
	}

	hide() {
		for (let guiObject2D of this.guiObjects2D) {
			guiObject2D.setHidden(true);
		}

		for (let guiObject3D of this.guiObjects3D) {
			guiObject3D.setHidden(true);
		}
	}

	show() {
		for (let guiObject2D of this.guiObjects2D) {
			guiObject2D.setHidden(false);
		}

		for (let guiObject3D of this.guiObjects3D) {
			guiObject3D.setHidden(false);
		}
	}

	reportCanvasResize(x: number, y: number) {
		this.resolutionWidth = x;
		this.resolutionHeight = y;
		this.gBuffer.setProportions(x, y);
		this.crtFramebuffer.setProportions(x, y);
		this.bloomExtractionInputFramebuffer.setProportions(x, y);
		this.bloomExtractionOutputFramebuffer.setProportions(x, y);
		// for (let buffer of this.pingPongFramebuffers) {
		// 	buffer.setProportions(x, y);
		// }
	}

	setShadowMappingResolution(res: number) {
		this.shadowResolution = res;
		this.shadowBuffer.setProportions(res, res);
	}

	loadTextureToStore(texturePath: string) {
		this.textureStore.getTexture(texturePath);
	}

	getTextureFromStore(path: string) {
		return this.textureStore.getTexture(path);
	}

	getNewQuad(texturePath: string): Quad {
		const length = this.quads.push(
			new Quad(
				gl,
				this.simpleShaderProgram,
				this.textureStore.getTexture(texturePath)
			)
		);
		return this.quads[length - 1];
	}

	getNewPhongQuad(diffusePath: string, specularPath: string): PhongQuad {
		const length = this.graphicObjects.push(
			new PhongQuad(
				gl,
				this.geometryPass,
				this.textureStore.getTexture(diffusePath),
				this.textureStore.getTexture(specularPath)
			)
		);
		return this.graphicObjects[length - 1] as PhongQuad;
	}

	async getNewMesh(
		meshPath: string,
		diffusePath: string,
		specularPath: string
	) {
		const response = await fetch(meshPath);
		const objContent = await response.text();

		const length = this.graphicObjects.push(
			new Mesh(
				gl,
				this.geometryPass,
				objContent,
				this.textureStore.getTexture(diffusePath),
				this.textureStore.getTexture(specularPath)
			)
		);

		return this.graphicObjects[length - 1];
	}

	getNewPointLight(): PointLight {
		const length = this.pointLights.push(
			new PointLight(gl, this.lightingPass)
		);
		return this.pointLights[length - 1];
	}

	getDirectionalLight(): DirectionalLight {
		return this.directionalLight;
	}

	getNew2DText(): TextObject2D {
		const length = this.guiObjects2D.push(new TextObject2D());
		return this.guiObjects2D[length - 1] as TextObject2D;
	}

	getNew3DText(): TextObject3D {
		const length = this.guiObjects3D.push(new TextObject3D());
		return this.guiObjects3D[length - 1];
	}

	getNewCheckbox(): Checkbox {
		const length = this.guiObjects2D.push(new Checkbox());
		return this.guiObjects2D[length - 1] as Checkbox;
	}

	getNewButton(): Button {
		const length = this.guiObjects2D.push(new Button());
		return this.guiObjects2D[length - 1] as Button;
	}

	getNewSlider(): Slider {
		const length = this.guiObjects2D.push(new Slider());
		return this.guiObjects2D[length - 1] as Slider;
	}

	getNewProgress(): Progress {
		const length = this.guiObjects2D.push(new Progress());
		return this.guiObjects2D[length - 1] as Progress;
	}

	getNewParticleSpawner(
		texturePath: string,
		numberOfStartingParticles: number = 0
	): ParticleSpawner {
		let length = this.particleSpawners.push(
			new ParticleSpawner(
				gl,
				this.particleShaderProgram,
				this.textureStore.getTexture(texturePath),
				numberOfStartingParticles
			)
		);
		return this.particleSpawners[length - 1];
	}

	deleteQuad(quad: Quad) {
		let index = this.quads.findIndex((q) => q == quad);
		if (index != -1) {
			this.quads.splice(index, 1);
		}
	}

	deleteGraphicsObject(object: GraphicsObject) {
		this.graphicObjects = this.graphicObjects.filter((o) => object !== o);
	}

	deletePointLight(light: PointLight) {
		this.pointLights = this.pointLights.filter((l) => light !== l);
	}

	deleteParticleSpawner(particleSpawner: ParticleSpawner) {
		this.particleSpawners = this.particleSpawners.filter((ps) => particleSpawner !== ps);
	}

	draw() {
		gl.enable(gl.DEPTH_TEST);

		// ---- Shadow pass ----
		this.shadowPass.use();
		gl.viewport(0, 0, this.shadowResolution, this.shadowResolution);
		this.shadowBuffer.bind(gl.FRAMEBUFFER);
		gl.clearColor(1.0, 1.0, 1.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		//Set uniforms
		this.directionalLight.calcAndSendLightSpaceMatrix(
			this.camera.getPosition(),
			this.shadowOffset,
			this.shadowPass.getUniformLocation("lightSpaceMatrix")[0]
		);

		//Render shadow pass
		for (let obj of this.graphicObjects.values()) {
			obj.changeShaderProgram(this.shadowPass);
			// TODO: Add phongGraphicsObject that has the same draw function and we don't have to check instanceof
			if (obj instanceof PhongQuad) {
				(obj as PhongQuad).draw(false);
			} else if (obj instanceof Mesh) {
				(obj as Mesh).draw(false);
			}
		}

		gl.viewport(0.0, 0.0, this.resolutionWidth, this.resolutionHeight);
		// ---------------------

		// Bind gbuffer and clear that with 0,0,0,0 (the alpha = 0 is important to be able to identify fragments in the lighting pass that have not been written with geometry)
		this.gBuffer.bind(gl.FRAMEBUFFER);
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(
			gl.COLOR_BUFFER_BIT |
				gl.DEPTH_BUFFER_BIT |
				gl.STENCIL_BUFFER_BIT
		);

		// ---- Geometry pass ----
		this.geometryPass.use();
		this.camera.bindViewProjMatrix(
			this.geometryPass.getUniformLocation("viewProjMatrix")[0]
		);

		for (let obj of this.graphicObjects.values()) {
			obj.changeShaderProgram(this.geometryPass);
			obj.draw();
		}
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
		gl.clear(
			gl.COLOR_BUFFER_BIT |
				gl.DEPTH_BUFFER_BIT |
				gl.STENCIL_BUFFER_BIT
		);

		// Disable depth testing for screen quad(s) rendering
		gl.disable(gl.DEPTH_TEST);

		// ---- Lighting pass ----
		this.lightingPass.use();

		gl.uniform3fv(
			this.lightingPass.getUniformLocation("camPos")[0],
			this.camera.getPosition().elements()
		);
		this.directionalLight.bind();
		this.directionalLight.calcAndSendLightSpaceMatrix(
			this.camera.getPosition(),
			this.shadowOffset,
			this.lightingPass.getUniformLocation("lightSpaceMatrix")[0]
		);
		// Point lights
		gl.uniform1i(
			this.lightingPass.getUniformLocation("nrOfPointLights")[0],
			this.pointLights.length
		);
		for (let i = 0; i < this.pointLights.length; i++) {
			this.pointLights[i].bind(i);
		}

		this.lightingQuad.draw();
		// -----------------------

		// ---- Simple shaded ----
		// Copy the depth buffer information from the gBuffer to the current depth buffer
		this.gBuffer.bind(gl.READ_FRAMEBUFFER);
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

		// Enable depth testing again
		gl.enable(gl.DEPTH_TEST);

		if (this.quads.length > 0) {
			// Only do this if there is something to simple shade

			this.simpleShaderProgram.use();
			this.camera.bindViewProjMatrix(
				this.simpleShaderProgram.getUniformLocation("viewProjMatrix")[0]
			);

			for (const quad of this.quads.values()) {
				quad.draw();
			}
		}
		// -----------------------

		// ---- Particles ----
		gl.enable(gl.DEPTH_TEST);
		this.particleShaderProgram.use();
		this.camera.bindViewProjMatrix(
			this.particleShaderProgram.getUniformLocation("viewProjMatrix")[0]
		);
		gl.uniform3fv(
			this.particleShaderProgram.getUniformLocation("cameraPos")[0],
			this.camera.getPosition().elements()
		);
		gl.uniform1f(
			this.particleShaderProgram.getUniformLocation("currentTime")[0],
			(Date.now() - applicationStartTime) * 0.001
		);
		for (const particleSpawner of this.particleSpawners.values()) {
			particleSpawner.draw();
		}
		// -------------------

		// ---- Post processing ----
		gl.disable(gl.DEPTH_TEST);
		if (this.useBloom) {
			this.bloomExtractionOutputFramebuffer.bind(gl.DRAW_FRAMEBUFFER);
			this.bloomExtraction.use();
			this.bloomExtractionInputFramebuffer.textures[0].bind(0);
			this.screenQuad.draw(false);

			gl.viewport(0, 0, this.bloomResolutionWidth, this.bloomResolutionHeight);
			// Blur the bright image (second of the two in bloomExtractionOutputFramebuffer)
			let horizontal = true,
				firstIteration = true;
			let amount = 5;
			this.gaussianBlur.use();
			for (let i = 0; i < amount; i++) {
				this.pingPongFramebuffers[Number(horizontal)].bind(
					gl.DRAW_FRAMEBUFFER
				);
				gl.uniform1ui(
					this.gaussianBlur.getUniformLocation("horizontal")[0],
					Number(horizontal)
				);
				if (firstIteration) {
					this.bloomExtractionOutputFramebuffer.textures[1].bind();
				} else {
					this.pingPongFramebuffers[Number(!horizontal)].textures[0].bind();
				}

				this.screenQuad.draw(false);
				horizontal = !horizontal;
				firstIteration = false;
			}

			
			gl.viewport(0, 0, this.resolutionWidth, this.resolutionHeight);

			// Combine the normal image with the blured bright image
			this.bloomBlending.use();
			this.bloomExtractionOutputFramebuffer.textures[0].bind(0); // Normal scene
			this.pingPongFramebuffers[Number(horizontal)].textures[0].bind(1); // Blurred bright image

			// Render result to screen or to crt framebuffer if doing crt effect after this.
			if (this.useCrt) {
				this.crtFramebuffer.bind(gl.DRAW_FRAMEBUFFER);
			} else {
				gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null); // Render directly to screen
			}
			this.screenQuad.draw(false);
		}

		if (this.useCrt) {
			// ---- Crt effect ----
			gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null); // Render directly to screen
			this.crtShaderProgram.use();
			this.crtFramebuffer.textures[0].bind(0);
			this.screenQuad.draw(false);
			// --------------------
		}
		// -------------------------

		// ---- GUI rendering ----
		for (let i = 0; i < this.guiObjects3D.length; i++) {
			if (!this.guiObjects3D[i].removed) {
				this.guiObjects3D[i].draw3D(this.camera.getViewProjMatrix());
			} else {
				this.guiObjects3D.splice(i, 1);
				i--;
			}
		}

		for (let i = 0; i < this.guiObjects2D.length; i++) {
			if (!this.guiObjects2D[i].removed) {
				this.guiObjects2D[i].draw();
			} else {
				this.guiObjects2D.splice(i, 1);
				i--;
			}
		}
		// -----------------------
	}

	private renderTextureToScreen(texture: Texture) {
		gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null); // Render directly to screen
		this.screenQuadShaderProgram.use();
		texture.bind();
		this.screenQuad.draw(false);
	}
}
