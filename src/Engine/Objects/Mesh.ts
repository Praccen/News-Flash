import GraphicsObject from "./GraphicsObject.js";
import Texture from "../Textures/Texture.js";
import Vec2 from "../Maths/Vec2.js";
import Vec3 from "../Maths/Vec3.js";
import ShaderProgram from "../ShaderPrograms/ShaderProgram.js";
import Triangle from "../Physics/Shapes/Triangle.js";
import { gl } from "../../main.js";

export default class Mesh extends GraphicsObject {
	// Protected
	protected vertices: Float32Array

	constructor(
		shaderProgram: ShaderProgram,
		vertices: Float32Array
	) {
		super(shaderProgram);
		
		this.vertices = vertices;
		this.setVertexData(this.vertices);
	}

	setupTriangles(triangles: Array<Triangle>) {
		triangles.length = 0; // Clear triangles
		for (let i = 0; i < this.vertices.length; i += 8 * 3) {
			// Go through the vertices
			// Save the positions as shapes in the input array
			const length = triangles.push(new Triangle());
			triangles[length - 1].setVertices(
				new Vec3([
					this.vertices[i],
					this.vertices[i + 1],
					this.vertices[i + 2],
				]),
				new Vec3([
					this.vertices[i + 8],
					this.vertices[i + 8 + 1],
					this.vertices[i + 8 + 2],
				]),
				new Vec3([
					this.vertices[i + 16],
					this.vertices[i + 16 + 1],
					this.vertices[i + 16 + 2],
				])
			);
		}
	}

	getVertexPositions(): Array<Vec3> {
		let returnArr = new Array<Vec3>();
		for (let i = 0; i < this.vertices.length; i += 8) {
			returnArr.push(
				new Vec3([
					this.vertices[i],
					this.vertices[i + 1],
					this.vertices[i + 2],
				])
			);
		}
		return returnArr;
	}

	draw() {
		this.bindVAO();
		gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 8);
	}
}
