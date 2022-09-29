import GraphicsObject from "./GraphicsObject.js";
import Texture from "../Textures/Texture.js";
import ShaderProgram from "../ShaderPrograms/ShaderProgram.js";
import Triangle from "../Physics/Shapes/Triangle.js";
import Vec3 from "../Maths/Vec3.js";

export default class PhongQuad extends GraphicsObject {
	// Public
	modelMatrix: Matrix4;
	textureMatrix: Matrix4;
	diffuse: Texture;
	specular: Texture;

	// Private
	private vertices: Float32Array;
	private indices: Int32Array;

	constructor(
		gl: WebGL2RenderingContext,
		shaderProgram: ShaderProgram,
		diffuse: Texture,
		specular: Texture
	) {
		super(gl, shaderProgram);

		// prettier-ignore
		this.vertices = new Float32Array([ 
            // positions        // normals         // uv
            -0.5,  0.5,  0.0,   0.0, 0.0, 1.0,     0.0, 1.0,
            -0.5, -0.5,  0.0,   0.0, 0.0, 1.0,     0.0, 0.0,
             0.5, -0.5,  0.0,   0.0, 0.0, 1.0,     1.0, 0.0,
             0.5,  0.5,  0.0,   0.0, 0.0, 1.0,     1.0, 1.0,
        ]);

		// prettier-ignore
		this.indices = new Int32Array([
            0, 1, 2,
            0, 2, 3,
        ]);
		this.setVertexData(this.vertices);
		this.setIndexData(this.indices);

		this.diffuse = diffuse;
		this.specular = specular;

		this.modelMatrix = new Matrix4(null);
		this.textureMatrix = new Matrix4(null);
	}

	setupShapes(triangles: Array<Triangle>) {
		triangles.length = 0; // Clear triangles
		for (let i = 0; i < this.indices.length; i += 3) {
			// Go through the vertices
			// Save the positions as shapes in the input array
			const length = triangles.push(new Triangle());
			triangles[length - 1].setVertices(
				new Vec3({
					x: this.vertices[this.indices[i] * 8],
					y: this.vertices[this.indices[i] * 8 + 1],
					z: this.vertices[this.indices[i] * 8 + 2],
				}),
				new Vec3({
					x: this.vertices[this.indices[i + 1] * 8],
					y: this.vertices[this.indices[i + 1] * 8 + 1],
					z: this.vertices[this.indices[i + 1] * 8 + 2],
				}),
				new Vec3({
					x: this.vertices[this.indices[i + 2] * 8],
					y: this.vertices[this.indices[i + 2] * 8 + 1],
					z: this.vertices[this.indices[i + 2] * 8 + 2],
				})
			);
		}
	}

	getVertexPositions(): Array<Vec3> {
		let returnArr = new Array<Vec3>();
		for (let i = 0; i < this.vertices.length; i += 8) {
			returnArr.push(
				new Vec3({
					x: this.vertices[i],
					y: this.vertices[i + 1],
					z: this.vertices[i + 2],
				})
			);
		}
		return returnArr;
	}

	draw(bindDiffuse: boolean = true, bindBoth: boolean = true) {
		this.bindVAO();

		if (bindDiffuse || bindBoth) {
			this.diffuse.bind(0);
		}

		if (bindBoth) {
			this.specular.bind(1);
		}

		let modelReturn: [WebGLUniformLocation, boolean] =
			this.shaderProgram.getUniformLocation("modelMatrix");
		if (modelReturn[1]) {
			this.gl.uniformMatrix4fv(
				modelReturn[0],
				false,
				this.modelMatrix.elements
			);
		}
		let textureReturn: [WebGLUniformLocation, boolean] =
			this.shaderProgram.getUniformLocation("textureMatrix");
		if (textureReturn[1]) {
			this.gl.uniformMatrix4fv(
				textureReturn[0],
				false,
				this.textureMatrix.elements
			);
		}

		this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_INT, 0);
	}
}
