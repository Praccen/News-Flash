import { gl } from "../main.js";
import Texture from "./Textures/Texture.js";

export default class Framebuffer {
	// Public
	textures: Array<Texture>;
	depthTexture: Texture;

	// Private
	private rbo: WebGLRenderbuffer;
	private fbo: WebGLFramebuffer;
	private width: number;
	private height: number;

	constructor(
		width: number,
		height: number,
		createDepthAttachment: boolean,
		colourAttachments: Array<{
			internalFormat: number;
			dataStorageType: number;
		}>
	) {
		this.width = width;
		this.height = height;

		this.fbo = gl.createFramebuffer();
		this.textures = new Array<Texture>(colourAttachments.length);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);

		let attachments = new Array<any>();
		for (let i = 0; i < colourAttachments.length; i++) {
			this.textures[i] = new Texture(
				false,
				colourAttachments[i].internalFormat,
				gl.RGBA,
				colourAttachments[i].dataStorageType
			);
			gl.bindTexture(gl.TEXTURE_2D, this.textures[i].texture);
			this.textures[i].setTextureData(null, this.width, this.height);
			this.textures[i].setTexParameters(
				gl.TEXTURE_MIN_FILTER,
				gl.LINEAR
			);
			this.textures[i].setTexParameters(
				gl.TEXTURE_MAG_FILTER,
				gl.LINEAR
			);
			this.textures[i].setTexParameters(
				gl.TEXTURE_WRAP_S,
				gl.CLAMP_TO_EDGE
			);
			this.textures[i].setTexParameters(
				gl.TEXTURE_WRAP_T,
				gl.CLAMP_TO_EDGE
			);
			gl.framebufferTexture2D(
				gl.FRAMEBUFFER,
				gl.COLOR_ATTACHMENT0 + i,
				gl.TEXTURE_2D,
				this.textures[i].texture,
				0
			);
			attachments.push(gl.COLOR_ATTACHMENT0 + i);
		}

		gl.drawBuffers(attachments);

		// More choices here would be good, not only texture or renderbuffer
		if (createDepthAttachment) {
			this.depthTexture = new Texture(
				false,
				gl.DEPTH_COMPONENT32F,
				gl.DEPTH_COMPONENT,
				gl.FLOAT
			);
			gl.bindTexture(gl.TEXTURE_2D, this.depthTexture.texture);
			this.depthTexture.setTextureData(null, this.width, this.height);
			gl.framebufferTexture2D(
				gl.FRAMEBUFFER,
				gl.DEPTH_ATTACHMENT,
				gl.TEXTURE_2D,
				this.depthTexture.texture,
				0
			);
		} else {
			this.rbo = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, this.rbo);
			gl.renderbufferStorage(
				gl.RENDERBUFFER,
				gl.DEPTH_STENCIL,
				this.width,
				this.height
			);

			gl.framebufferRenderbuffer(
				gl.FRAMEBUFFER,
				gl.DEPTH_STENCIL_ATTACHMENT,
				gl.RENDERBUFFER,
				this.rbo
			);
		}

		if (
			gl.checkFramebufferStatus(gl.FRAMEBUFFER) !=
			gl.FRAMEBUFFER_COMPLETE
		) {
			console.warn("ERROR::FRAMEBUFFER:: Framebuffer is not complete!");
		}

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	setProportions(width: number, height: number) {
		this.width = width;
		this.height = height;
		for (let texture of this.textures) {
			texture.setTextureData(null, this.width, this.height);
		}
		if (this.depthTexture) {
			this.depthTexture.setTextureData(null, this.width, this.height);
		}

		if (this.rbo) {
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
			gl.bindRenderbuffer(gl.RENDERBUFFER, this.rbo);
			gl.renderbufferStorage(
				gl.RENDERBUFFER,
				gl.DEPTH24_STENCIL8,
				width,
				height
			);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}
	}

	bind(target: number) {
		gl.bindFramebuffer(target, this.fbo);
	}
}
