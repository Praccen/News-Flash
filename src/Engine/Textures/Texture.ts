import { gl } from "../../main.js";

export default class Texture {
	// Public
	width: number;
	height: number;
	texture: WebGLTexture;

	// private missingTextureData: Uint8Array;
	private useMipMap: boolean;

	private internalFormat: number;
	private format: number;
	private dataStorageType: number;

	constructor(
		useMipMap: boolean = true,
		internalFormat: number = gl.RGBA,
		format: number = gl.RGBA,
		dataStorageType: number = gl.UNSIGNED_BYTE
	) {

		// this.missingTextureData = new Uint8Array([
		//     255, 255, 255, 255, 0, 0, 0, 255,
		//     0, 0, 0, 255, 255, 255, 255, 255
		// ]);

		this.useMipMap = useMipMap;

		this.internalFormat = internalFormat;
		this.format = format;
		this.dataStorageType = dataStorageType;

		// Generate texture
		this.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_WRAP_S,
			gl.REPEAT
		);
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_WRAP_T,
			gl.REPEAT
		);
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MIN_FILTER,
			gl.NEAREST
		);
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MAG_FILTER,
			gl.NEAREST
		);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

		this.width = 1;
		this.height = 1;
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			this.internalFormat,
			this.width,
			this.height,
			0,
			this.format,
			this.dataStorageType,
			null
		);

		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	setTextureData(data: Uint8Array, width: number, height: number) {
		this.width = width;
		this.height = height;
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			this.internalFormat,
			width,
			height,
			0,
			this.format,
			this.dataStorageType,
			data
		);
		if (this.useMipMap) {
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.texParameteri(
				gl.TEXTURE_2D,
				gl.TEXTURE_MIN_FILTER,
				gl.LINEAR_MIPMAP_LINEAR
			);
		}
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	updateTextureSubData(
		data: Uint8Array,
		xOffset: number,
		yOffset: number,
		width: number,
		height: number
	): boolean {
		if (xOffset + width <= this.width && yOffset + height <= this.height) {
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
			gl.texSubImage2D(
				gl.TEXTURE_2D,
				0,
				xOffset,
				yOffset,
				width,
				height,
				this.internalFormat,
				this.dataStorageType,
				data
			);
			if (this.useMipMap) {
				gl.generateMipmap(gl.TEXTURE_2D);
				gl.texParameteri(
					gl.TEXTURE_2D,
					gl.TEXTURE_MIN_FILTER,
					gl.LINEAR_MIPMAP_LINEAR
				);
			}
			gl.bindTexture(gl.TEXTURE_2D, null);
			return true;
		}

		console.log("Tried to update texture sub data outside of bounds\n");
		return false;
	}

	bind(textureIndex: number = 0) {
		gl.activeTexture(gl.TEXTURE0 + textureIndex);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
	}

	loadFromFile(URL: string) {
		let image = new Image();
		image.crossOrigin = "";
		image.src = URL;
		let self = this;
		image.addEventListener("load", function () {
			// Now that the image has loaded copy it to the texture and save the width/height.
			self.width = image.width;
			self.height = image.height;
			gl.bindTexture(gl.TEXTURE_2D, self.texture);
			gl.texImage2D(
				gl.TEXTURE_2D,
				0,
				self.internalFormat,
				self.format,
				self.dataStorageType,
				image
			);
			if (self.useMipMap) {
				gl.generateMipmap(gl.TEXTURE_2D);
				gl.texParameteri(
					gl.TEXTURE_2D,
					gl.TEXTURE_MIN_FILTER,
					gl.LINEAR_MIPMAP_LINEAR
				);
			}
		});
	}

	setTexParameters(a: number, b: number) {
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.texParameteri(gl.TEXTURE_2D, a, b);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
}

// Texture::~Texture() {
// 	glDeleteTextures(1, &m_texture);
// }
