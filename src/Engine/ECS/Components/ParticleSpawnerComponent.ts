import ParticleSpawner from "../../Objects/ParticleSpawner.js";
import { Component, ComponentTypeEnum} from "./Component.js";

export default class ParticleSpawnerComponent extends Component {
    lifetime: number;
    resetTimer: number;
    particleSpawner: ParticleSpawner;

    constructor(particleSpawner: ParticleSpawner) {
        super(ComponentTypeEnum.PARTICLESPAWNER);

        this.lifetime = 1.0;
        this.resetTimer = 0.0;
        this.particleSpawner = particleSpawner;
    }
}