import { gl } from "../../main.js";
import Vec2 from "../Maths/Vec2.js";
import Vec3 from "../Maths/Vec3.js";
import { IntersectionTester } from "../Physics/IntersectionTester.js";
import Ray from "../Physics/Shapes/Ray.js";
import Triangle from "../Physics/Shapes/Triangle.js";
import ShaderProgram from "../ShaderPrograms/ShaderProgram.js";
import Texture from "../Textures/Texture.js";
import Mesh from "./Mesh.js";

export default class Heightmap extends Mesh {
	imageData: Uint8ClampedArray;

	xResolution: number;
	zResolution: number;
	xQuadSize: number;
	zQuadSize: number;
	private indices: Int32Array;

	constructor(shaderProgram: ShaderProgram) {
		super(shaderProgram, null);
		this.xResolution = 0;
		this.zResolution = 0;
		this.createPlane(2, 2, 1, 1);
		this.imageData = null;
	}

	setupTriangles(triangles: Array<Triangle>) {
		triangles.length = 0; // Clear triangles
		for (let i = 0; i < this.indices.length; i += 3) {
			// Go through the vertices
			// Save the positions as shapes in the input array
			const length = triangles.push(new Triangle());
			triangles[length - 1].setVertices(
				new Vec3([
					this.vertices[this.indices[i] * 8],
					this.vertices[this.indices[i] * 8 + 1],
					this.vertices[this.indices[i] * 8 + 2],
				]),
				new Vec3([
					this.vertices[this.indices[i + 1] * 8],
					this.vertices[this.indices[i + 1] * 8 + 1],
					this.vertices[this.indices[i + 1] * 8 + 2],
				]),
				new Vec3([
					this.vertices[this.indices[i + 2] * 8],
					this.vertices[this.indices[i + 2] * 8 + 1],
					this.vertices[this.indices[i + 2] * 8 + 2],
				])
			);
		}
	}

	private updateVertexData(x: number, z: number, values: number[]) {
		let offset = z * this.xResolution * 8 + x * 8;
		for (let i = 0; i < values.length; i++) {
			this.vertices[offset + i] = values[i];
		}
	}

	private updateVertexHeight(x: number, z: number, height: number) {
		this.vertices[z * this.xResolution * 8 + x * 8 + 1] = height;
	}

	createPlane(
		xResolution: number,
		zResolution: number,
		xQuadSize: number,
		zQuadSize: number
	) {
		this.xResolution = Math.max(Math.ceil(xResolution), 2);
		this.zResolution = Math.max(Math.ceil(zResolution), 2);
		this.xQuadSize = xQuadSize;
		this.zQuadSize = zQuadSize;
		this.vertices = new Float32Array(
			this.xResolution * this.zResolution * 8
		).fill(0.0);
		for (let z = 0; z < this.zResolution; z++) {
			for (let x = 0; x < this.xResolution; x++) {
				this.updateVertexData(x, z, [
					x * xQuadSize,
					0.0,
					z * zQuadSize,
					0.0,
					1.0,
					0.0,
					x / (this.xResolution - 1),
					z / (this.zResolution - 1),
				]);
			}
		}

		this.setVertexData(this.vertices);

		this.indices = new Int32Array(
			(this.xResolution - 1) * (this.zResolution - 1) * 6
		).fill(0);

		for (let z = 0; z < this.zResolution - 1; z++) {
			for (let x = 0; x < this.xResolution - 1; x++) {
				let indicesOffset = z * (this.xResolution - 1) * 6 + x * 6;
				let topLeftIndex = z * this.xResolution + x;
				let bottomLeftIndex = topLeftIndex + this.xResolution;

				// Make the diagonals go zig zag to hide repeating patterns along the diagonals
				if ((z + x) % 2 == 0) {
					this.indices[indicesOffset + 0] = topLeftIndex;
					this.indices[indicesOffset + 1] = bottomLeftIndex;
					this.indices[indicesOffset + 2] = bottomLeftIndex + 1;
					this.indices[indicesOffset + 3] = topLeftIndex;
					this.indices[indicesOffset + 4] = bottomLeftIndex + 1;
					this.indices[indicesOffset + 5] = topLeftIndex + 1;
				} else {
					this.indices[indicesOffset + 0] = topLeftIndex;
					this.indices[indicesOffset + 1] = bottomLeftIndex;
					this.indices[indicesOffset + 2] = topLeftIndex + 1;
					this.indices[indicesOffset + 3] = topLeftIndex + 1;
					this.indices[indicesOffset + 4] = bottomLeftIndex;
					this.indices[indicesOffset + 5] = bottomLeftIndex + 1;
				}
			}
		}

		this.setIndexData(this.indices);
	}

	/**
	 *
	 * @param texturePath - texture path / URL
	 * @param createResolutionFromPixels - if the plane should be recreated using the resolution of the picture
	 */
	async readHeightDataFromTexture(
		texturePath: string,
		createResolutionFromPixels: boolean = true
	) {
		let getPixel = function (img: HTMLImageElement, x: number, y: number) {
			let canvas = document.createElement("canvas");
			canvas.width = 1;
			canvas.height = 1;
			canvas.getContext("2d").drawImage(img, x, y, 1, 1, 0, 0, 1, 1);
			let pixelData = canvas.getContext("2d").getImageData(0, 0, 1, 1).data;

			return pixelData;
		};

		let loadImage = function (src: string): Promise<HTMLImageElement> {
			return new Promise((resolve, reject) => {
				let img = new Image();
				img.onload = () => resolve(img);
				img.onerror = reject;
				img.src = src;
			});
		};

		let resizeImage = function (
			image: HTMLImageElement,
			newWidth: number,
			newHeight: number
		): Uint8ClampedArray {
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");
			canvas.width = newWidth;
			canvas.height = newHeight;
			ctx.drawImage(image, 0, 0, newWidth, newHeight);
			return ctx.getImageData(0, 0, newWidth, newHeight).data;
		};

		let texture = await loadImage(texturePath);

		if (createResolutionFromPixels) {
			this.createPlane(texture.width, texture.height, 1.0, 1.0);
		}

		// Resize the image to the same resolution as our hightmap
		this.imageData = resizeImage(texture, this.xResolution, this.zResolution);

		// Go through the heightmap and set the height to the corrsponding pixel in the (resized) image
		for (let z = 0; z < this.zResolution; z++) {
			for (let x = 0; x < this.xResolution; x++) {
				this.updateVertexHeight(
					x,
					z,
					this.imageData[x * 4 + z * this.xResolution * 4] / 255.0
				);
			}
		}

		this.setVertexData(this.vertices);
	}

	getHeightFromWorldPosition(
		heightmapTransformMatrix: Matrix4,
		worldPosition: Vec3,
		invertedTransformMatrix?: Matrix4
	): number {
		// Invert the transform matrix used for the heightmap
		let invertedMatrix;
		if (invertedTransformMatrix != undefined) {
			invertedMatrix = invertedTransformMatrix;
		} else {
			invertedMatrix = new Matrix4(heightmapTransformMatrix).invert();
		}

		// Take the world position and transform it into heightmap local coordinates
		let transformedPos = invertedMatrix.multiplyVector4(
			new Vector4([...worldPosition, 1.0])
		);

		// Get the height of the heightmap at the corresponding position
		let height = this.getHeight(
			transformedPos.elements[0],
			transformedPos.elements[2]
		);

		if (height == null) {
			return null;
		}

		transformedPos.elements[1] = height; // set the y coord to the heightmap height
		transformedPos.elements[3] = 1.0; // set the w to 1 to be able to transform the position back into world space
		transformedPos = heightmapTransformMatrix.multiplyVector4(transformedPos); // To world space! :D

		return transformedPos.elements[1];
	}

	getHeight(x: number, z: number): number {
		if (
			x < 0 ||
			x > this.xResolution * this.xQuadSize ||
			z < 0 ||
			z > this.zResolution * this.zQuadSize
		) {
			return null;
		}

		// Find out what triangle to get the height from
		let baseX = Math.floor(x / this.xQuadSize);
		let baseZ = Math.floor(z / this.zQuadSize);
		let diffX = x - baseX * this.xQuadSize;
		let diffZ = z - baseZ * this.zQuadSize;

		let topRightHeight =
			this.imageData[(baseX + 1) * 4 + (baseZ + 0) * this.xResolution * 4] /
			255.0;
		let bottomLeftHeight =
			this.imageData[(baseX + 0) * 4 + (baseZ + 1) * this.xResolution * 4] /
			255.0;
		let topLeftHeight =
			this.imageData[(baseX + 0) * 4 + (baseZ + 0) * this.xResolution * 4] /
			255.0;
		let bottomRightHeight =
			this.imageData[(baseX + 1) * 4 + (baseZ + 1) * this.xResolution * 4] /
			255.0;

		if ((baseZ + baseX) % 2 == 0) {
			// Because of the zig-zagging mentioned in the createPlane indices set up
			/*
            Base
            |
            v
            +--------+ x
            |\    A  |
            |   \    |
            | B    \ |
            +--------+
            z
            */
			if (diffX > diffZ) {
				// A
				let kx = topLeftHeight - topRightHeight;
				let kz = bottomRightHeight - topRightHeight;
				diffX = 1 - diffX;
				return topRightHeight + kx * diffX + kz * diffZ;
			} else {
				// B
				let kx = bottomRightHeight - bottomLeftHeight;
				let kz = topLeftHeight - bottomLeftHeight;
				diffZ = 1 - diffZ;
				return bottomLeftHeight + kx * diffX + kz * diffZ;
			}
		} else {
			/*
            Base
            |
            v
            +--------+ x
            |  A    /|
            |    /   |
            | /    B |
            +--------+
            z
            */
			if (diffX < 1 - diffZ) {
				// A
				let kx = topRightHeight - topLeftHeight;
				let kz = bottomLeftHeight - topLeftHeight;
				return topLeftHeight + kx * diffX + kz * diffZ;
			} else {
				// B
				let kx = bottomLeftHeight - bottomRightHeight;
				let kz = topRightHeight - bottomRightHeight;
				diffX = 1 - diffX;
				diffZ = 1 - diffZ;
				return bottomRightHeight + kx * diffX + kz * diffZ;
			}
		}
	}

	draw() {
		this.bindVAO();
		gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_INT, 0);
	}
}
