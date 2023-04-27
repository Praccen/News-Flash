import { gl } from "../../../main.js";
import ShaderProgram from "../ShaderProgram.js";

export const skyboxVertexSrc: string = `#version 300 es

layout (location = 0) in vec3 inPos;

out vec3 texCoords;

uniform mat4 viewProjMatrix;

void main()
{
    texCoords = inPos;
	texCoords.y *= -1.0;
    vec4 pos = viewProjMatrix * vec4(inPos, 1.0);
    gl_Position = pos.xyww; 
}  
`;

const skyboxFragmentSrc: string = `#version 300 es
precision highp float;

out vec4 FragColor;
in vec3 texCoords;

uniform samplerCube skybox;

void main() {
    FragColor = texture(skybox, texCoords).rgba;
}
`;

class SkyboxShaderProgram extends ShaderProgram {
	constructor() {
		super("SkyboxShaderProgram", skyboxVertexSrc, skyboxFragmentSrc);

		this.setUniformLocation("skybox");
		gl.uniform1i(this.uniformBindings["skybox"], 0);

		this.setUniformLocation("viewProjMatrix");
	}

	setupVertexAttributePointers() {
		// Change if input layout changes in shaders
		const stride = 3 * 4;
		gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
		gl.enableVertexAttribArray(0);
	}
}

export let skyboxShaderProgram = null;

export let createSkyboxShaderProgram = function () {
	skyboxShaderProgram = new SkyboxShaderProgram();
};