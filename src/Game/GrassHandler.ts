import Vec2 from "../Engine/Maths/Vec2.js";
import Vec3 from "../Engine/Maths/Vec3.js";
import GraphicsBundle from "../Engine/Objects/GraphicsBundle.js";
import GrassSpawner from "../Engine/Objects/GrassSpawner.js";
import Heightmap from "../Engine/Objects/Heightmap.js";
import Scene from "../Engine/Rendering/Scene.js";
import Doggo from "./Doggo.js";
import { options } from "./GameMachine.js";

export default class GrassHandler {
	private grassSpawners: Array<{ spawner: GrassSpawner; offset: Vec2 }>;
	private grassStrawsPerSpawner: number;
	private grassStrawsSpawned: number;
	private grassSpawnerSide: number;
	private grassElevationCutoff: number;

	private scene: Scene;
	private mapBundle: GraphicsBundle;
	private doggo: Doggo;

	constructor(scene: Scene, mapBundle: GraphicsBundle, doggo: Doggo) {
		this.scene = scene;
		this.mapBundle = mapBundle;
		this.doggo = doggo;

		this.grassSpawners = new Array<{ spawner: GrassSpawner; offset: Vec2 }>();
		this.grassStrawsPerSpawner = options.grassDensity;
		this.grassStrawsSpawned = 0;
		this.grassSpawnerSide = 25;
		this.grassElevationCutoff = -3.7;

		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				this.createGrass(
					-10.0 + i * this.grassSpawnerSide,
					-10.0 + j * this.grassSpawnerSide
				);
			}
		}
	}

	createGrass(offsetX, offsetY) {
		let texturePathColour = "Assets/textures/GrassStraw.png";
		let texturePathSpec = "Assets/textures/GrassStraw_Spec.png";

		let bundle = this.scene.getNewGrassSpawner(
			texturePathColour,
			texturePathSpec,
			this.grassStrawsPerSpawner
		);
		// if (Math.random() > 0.5) {
		// 	bundle.emission = this.stateAccessible.textureStore.getTexture(
		// 		"Assets/textures/GrassStraw_Spec.png"
		// 	);
		// }

		this.grassSpawners.push({
			spawner: bundle.graphicsObject as GrassSpawner,
			offset: new Vec2([offsetX, offsetY]),
		});
	}

	/**
	 * Spawn as much grass as possible within 20 milliseconds or until all grass straws have been spawned
	 */
	fillGrass() {
		let startTime = Date.now();

		let sqrt = Math.pow(this.grassStrawsPerSpawner, 0.5);
		let strawDist = this.grassSpawnerSide / sqrt;

		let invertedMatrix = new Matrix4(this.mapBundle.modelMatrix).invert(); // Invert the transform matrix used for the heightmap

		let data = new Array<number>();
		let firstIndex = this.grassStrawsSpawned % this.grassStrawsPerSpawner;
		let lastSpawnerIndex = Math.floor(
			this.grassStrawsSpawned / this.grassStrawsPerSpawner
		);

		// Spawn as much grass as possible within 20 milliseconds every frame until all grass straws have been spawned
		while (
			Date.now() - startTime < 20 &&
			this.grassStrawsSpawned <
				this.grassSpawners.length * this.grassStrawsPerSpawner
		) {
			let spawnerIndex = Math.floor(
				this.grassStrawsSpawned / this.grassStrawsPerSpawner
			);
			let i = this.grassStrawsSpawned % this.grassStrawsPerSpawner;

			if (lastSpawnerIndex != spawnerIndex) {
				// Switching spawner, update the data for the previous one
				this.grassSpawners[lastSpawnerIndex].spawner.bufferSubDataUpdate(
					firstIndex * 7,
					new Float32Array(data)
				);

				// Clear data and reset index
				data.length = 0;
				firstIndex = 0;
			}

			lastSpawnerIndex = spawnerIndex;

			let offset = this.grassSpawners[spawnerIndex].offset;
			let grassStrawPosition = new Vec3([
				// Grass position (x and z)
				offset.x + (i % sqrt) * strawDist + strawDist * (Math.random() - 0.5),
				0.0,
				offset.y +
					Math.floor(i / sqrt) * strawDist +
					strawDist * (Math.random() - 0.5),
			]);

			// Get the height of the heightmap at the corresponding position
			let height = (<Heightmap>(
				this.mapBundle.graphicsObject
			)).getHeightFromWorldPosition(
				this.mapBundle.modelMatrix,
				grassStrawPosition,
				invertedMatrix
			);
			let size = 0.0;

			if (height != null) {
				let normal = (<Heightmap>(
					this.mapBundle.graphicsObject
				)).getNormalFromWorldPosition(this.mapBundle.modelMatrix, grassStrawPosition, invertedMatrix);

				if (normal != null) {
					if (normal.y < 0.999999999 || height < this.grassElevationCutoff) {
						// Given that the x and z coords of the position are on the heightmap
						grassStrawPosition.y = height;
						size = Math.random() * 0.4 + 0.1;
					}
				}
			}

			data.push(...grassStrawPosition); // Position of straw
			data.push(size); // Size of straw
			data.push(
				...[
					(Math.random() - 0.5) * 0.1,
					(Math.random() - 0.5) * 0.1,
					(Math.random() - 0.5) * 0.1,
				]
			); // TipOffset

			this.grassStrawsSpawned++;
		}

		this.grassSpawners[lastSpawnerIndex].spawner.bufferSubDataUpdate(
			firstIndex * 7,
			new Float32Array(data)
		);
	}

	updateGrass() {
		const doggoPosition = this.doggo.getPosition();
		const doggoVelocity = this.doggo.getVelocity();

		let sqrt = Math.pow(this.grassStrawsPerSpawner, 0.5);
		let strawDist = this.grassSpawnerSide / sqrt;

		let invertedMatrix = new Matrix4(this.mapBundle.modelMatrix).invert(); // Invert the transform matrix used for the heightmap

		for (let grassSpawner of this.grassSpawners) {
			if (
				grassSpawner.offset.x > doggoPosition.x - this.grassSpawnerSide &&
				grassSpawner.offset.x < doggoPosition.x &&
				grassSpawner.offset.y > doggoPosition.z - this.grassSpawnerSide &&
				grassSpawner.offset.y < doggoPosition.z
			) {
				if (
					doggoPosition.y -
						(<Heightmap>(
							this.mapBundle.graphicsObject
						)).getHeightFromWorldPosition(
							this.mapBundle.modelMatrix,
							doggoPosition,
							invertedMatrix
						) <
					1.0
				) {
					let diffX = doggoPosition.x - grassSpawner.offset.x;
					let diffY = doggoPosition.z - grassSpawner.offset.y;

					let middleX = Math.floor(diffX / strawDist);
					let middleY = Math.floor(diffY / strawDist);

					for (let x = middleX - 10; x < middleX + 11; x++) {
						for (let y = middleY - 10; y < middleY + 11; y++) {
							let dist = new Vec2([
								x * strawDist - diffX,
								y * strawDist - diffY,
							]);
							if (dist.len() < 0.3) {
								let index = Math.floor(x + y * sqrt);
								if (index > 0 && index < this.grassStrawsPerSpawner) {
									let offset = new Vec3([doggoVelocity.x, 0.0, doggoVelocity.z])
										.normalize()
										.multiply(0.2);
									offset.y = -0.2;
									grassSpawner.spawner.setGrassTipOffset(index, offset);
								}
							}
						}
					}
				}
			}
		}
	}

	update(dt: number) {
		if (
			this.grassStrawsSpawned <
			this.grassSpawners.length * this.grassStrawsPerSpawner
		) {
			this.fillGrass();
		}

		if (options.foldableGrass) {
			this.updateGrass();
		}
	}
}
