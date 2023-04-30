import { gl, windowInfo } from "../../../main";
import Framebuffer from "../../Framebuffer";
import Texture from "../../Textures/Texture";
import ScreenQuad from "../../Objects/ScreenQuad";
import { screenQuadShaderProgram } from "../../ShaderPrograms/ScreenQuadShaderProgram";
import { bloomExtraction } from "../../ShaderPrograms/PostProcessing/BloomExtraction";
import { gaussianBlur } from "../../ShaderPrograms/PostProcessing/GaussianBlur";
import { bloomBlending } from "../../ShaderPrograms/PostProcessing/BloomBlending";

export default class BloomRenderPass {
	private bloomResolutionWidth: number;
	private bloomResolutionHeight: number;
	// private bloomExtractionInputFramebuffer: Framebuffer;
	private bloomExtractionOutputFramebuffer: Framebuffer;
	private pingPongFramebuffers: Array<Framebuffer>; // 2 frambuffers to go back and fourth between

	private screenQuad: ScreenQuad;
	outputFramebuffer: Framebuffer;

	constructor(inputTextures: Texture[]) {
		this.bloomExtractionOutputFramebuffer = new Framebuffer(
			windowInfo.resolutionWidth,
			windowInfo.resolutionHeight,
			[new Texture(false), new Texture(false)],
			null
		);
		this.pingPongFramebuffers = new Array<Framebuffer>(2);
		this.bloomResolutionWidth = 1280;
		this.bloomResolutionHeight = 720;
		for (let i = 0; i < 2; i++) {
			this.pingPongFramebuffers[i] = new Framebuffer(
				this.bloomResolutionWidth,
				this.bloomResolutionHeight,
				[new Texture(false)],
				null
			);
		}

		this.screenQuad = new ScreenQuad(screenQuadShaderProgram, inputTextures);
		this.outputFramebuffer = null;
	}

	setResolution(x: number, y: number) {
		this.bloomExtractionOutputFramebuffer.setProportions(x, y);

		// for (let buffer of this.pingPongFramebuffers) {
		// 	buffer.setProportions(x, y);
		// }
	}

	private bindFramebuffers() {
		// Render result to screen or to crt framebuffer if doing crt effect after this.
		if (this.outputFramebuffer == undefined) {
			gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null); // Render directly to screen
		} else {
			this.outputFramebuffer.bind(gl.DRAW_FRAMEBUFFER);
		}
	}

	draw() {
		gl.disable(gl.DEPTH_TEST);

		this.bloomExtractionOutputFramebuffer.bind(gl.DRAW_FRAMEBUFFER);
		bloomExtraction.use();
		this.screenQuad.draw(true);

		gl.viewport(0, 0, this.bloomResolutionWidth, this.bloomResolutionHeight);
		// Blur the bright image (second of the two in bloomExtractionOutputFramebuffer)
		let horizontal = true,
			firstIteration = true;
		let amount = 5;
		gaussianBlur.use();
		for (let i = 0; i < amount; i++) {
			this.pingPongFramebuffers[Number(horizontal)].bind(gl.DRAW_FRAMEBUFFER);
			gl.uniform1ui(
				gaussianBlur.getUniformLocation("horizontal")[0],
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

		gl.viewport(0, 0, windowInfo.resolutionWidth, windowInfo.resolutionHeight);

		// Combine the normal image with the blured bright image
		bloomBlending.use();
		this.bloomExtractionOutputFramebuffer.textures[0].bind(0); // Normal scene
		this.pingPongFramebuffers[Number(horizontal)].textures[0].bind(1); // Blurred bright image

		this.bindFramebuffers();
		this.screenQuad.draw(false);

		gl.enable(gl.DEPTH_TEST);
	}
}
