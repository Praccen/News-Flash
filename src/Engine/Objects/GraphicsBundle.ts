import { gl } from "../../main.js";
import Texture from "../Textures/Texture.js";
import GraphicsObject from "./GraphicsObject.js";


export default class GraphicsBundle {
	modelMatrix: Matrix4;
	textureMatrix: Matrix4;

    diffuse: Texture;
	specular: Texture;

    graphicsObject: GraphicsObject;

	constructor(diffuse: Texture, specular: Texture, graphicsObject: GraphicsObject) {
        this.diffuse = diffuse;
        this.specular = specular;

		this.modelMatrix = new Matrix4(null);
		this.textureMatrix = new Matrix4(null);

        this.graphicsObject = graphicsObject;
	}

	draw(bindSpecular: boolean = true) {
        this.diffuse.bind(0);

		if (bindSpecular) {
			this.specular.bind(1);
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
