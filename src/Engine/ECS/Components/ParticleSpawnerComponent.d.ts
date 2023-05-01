import ParticleSpawner from "../../Objects/ParticleSpawner";
import { Component } from "./Component";
export default class ParticleSpawnerComponent extends Component {
    lifeTime: number;
    resetTimer: number;
    particleSpawner: ParticleSpawner;
    constructor(particleSpawner: ParticleSpawner);
}
