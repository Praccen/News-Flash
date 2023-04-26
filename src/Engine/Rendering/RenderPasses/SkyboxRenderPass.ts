import { gl } from "../../../main.js";
import Skybox from "../../Objects/Skybox.js";
import { skyboxShaderProgram } from "../../ShaderPrograms/Skybox/SkyboxShaderProgram.js";
import CubeMap from "../../Textures/CubeMap.js";
import Camera from "../../Camera.js";

export default class SkyboxRenderPass {
	private skybox: Skybox;

	constructor() {
		this.skybox = null;
	}

	setSkybox(cubemap: CubeMap) {
		this.skybox = new Skybox(skyboxShaderProgram, cubemap);
	}

	draw(camera: Camera) {
		if (this.skybox != undefined) {
			gl.enable(gl.DEPTH_TEST);
			skyboxShaderProgram.use();
			camera.bindViewProjMatrix(
				skyboxShaderProgram.getUniformLocation("viewProjMatrix")[0],
				true
			);
			gl.depthFunc(gl.LEQUAL);
			this.skybox.draw();
			gl.depthFunc(gl.LESS);
		}
	}
}
