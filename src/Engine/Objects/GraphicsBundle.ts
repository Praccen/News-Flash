import { gl } from "../../main.js";
import Texture from "../Textures/Texture.js";
import GraphicsObject from "./GraphicsObject.js";


export default class GraphicsBundle {
	modelMatrix: Matrix4;
	textureMatrix: Matrix4;

    diffuse: Texture;
	specular: Texture;
	emission: Texture;

    graphicsObject: GraphicsObject;

	constructor(diffuse: Texture, specular: Texture, graphicsObject: GraphicsObject, emissionMap?: Texture) {
        this.diffuse = diffuse;
        this.specular = specular;

		if (emissionMap != undefined) {
			this.emission = emissionMap;
		}
		else {
			this.emission = new Texture();
			this.emission.setTextureData(new Uint8Array([0.0, 0.0, 0.0, 0.0]), 1, 1);
		}

		this.modelMatrix = new Matrix4(null);
		this.textureMatrix = new Matrix4(null);

        this.graphicsObject = graphicsObject;
	}

	draw(bindSpecialTextures: boolean = true) {
        this.diffuse.bind(0);

		if (bindSpecialTextures) {
			this.specular.bind(1);
			this.emission.bind(2);
		}

		let modelReturn: [WebGLUniformLocation, boolean] =
			this.graphicsObject.shaderProgram.getUniformLocation("modelMatrix");
		if (modelReturn[1]) {
			gl.uniformMatrix4fv(
				modelReturn[0],
				false,
				this.modelMatrix.elements
			);
		}
		let textureReturn: [WebGLUniformLocation, boolean] =
			this.graphicsObject.shaderProgram.getUniformLocation("textureMatrix");
		if (textureReturn[1]) {
			gl.uniformMatrix4fv(
				textureReturn[0],
				false,
				this.textureMatrix.elements
			);
		}

        this.graphicsObject.draw();
	}
}
