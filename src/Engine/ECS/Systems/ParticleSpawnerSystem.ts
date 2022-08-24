import System from "./System.js";
import ParticleSpawnerComponent from "../Components/ParticleSpawnerComponent.js";
import { ComponentTypeEnum } from "../Components/Component.js";
import PositionComponent from "../Components/PositionComponent.js";

export default class ParticleSpawnerSystem extends System {
	constructor() {
		super([ComponentTypeEnum.PARTICLESPAWNER, ComponentTypeEnum.POSITION]);
	}

	update(dt: number) {
		for (const e of this.entities) {
			let particleComp = <ParticleSpawnerComponent>(
				e.getComponent(ComponentTypeEnum.PARTICLESPAWNER)
			);
			let posComp = <PositionComponent>(
				e.getComponent(ComponentTypeEnum.POSITION)
			);

			if (particleComp && posComp) {
				let currentParticle = Math.floor(
					(particleComp.resetTimer / Math.max(particleComp.lifeTime, 0.00001)) *
						particleComp.particleSpawner.getNumberOfParticles()
				);
				particleComp.resetTimer += dt;
				let endParticle = Math.floor(
					(particleComp.resetTimer / Math.max(particleComp.lifeTime, 0.00001)) *
						particleComp.particleSpawner.getNumberOfParticles()
				);
				for (
					currentParticle;
					currentParticle < endParticle;
					currentParticle++
				) {
					particleComp.particleSpawner.resetParticleStartTime(
						currentParticle %
							particleComp.particleSpawner.getNumberOfParticles()
					);
					particleComp.particleSpawner.setParticleStartPosition(
						currentParticle %
							particleComp.particleSpawner.getNumberOfParticles(),
						posComp.position
					);
				}
				if (particleComp.resetTimer > particleComp.lifeTime) {
					particleComp.resetTimer -= particleComp.lifeTime;
				}
			}
		}
	}
}
