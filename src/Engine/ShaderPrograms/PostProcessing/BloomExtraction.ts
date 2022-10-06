import ShaderProgram from "../ShaderProgram.js";
import { screenQuadVertexSrc } from "../ScreenQuadShaderProgram.js";

const bloomExtractionFragmentSrc: string = `#version 300 es
precision highp float;

in vec2 texCoords;

layout (location = 0) out vec4 normalShaded;
layout (location = 1) out vec4 brightOnly;

uniform sampler2D inputTexture;

void main() {
	normalShaded = texture(inputTexture, texCoords);
    
    // check whether fragment output is higher than threshold, if so output as brightness color
    float brightness = normalShaded.r + normalShaded.g + normalShaded.b;
    if(brightness > 1.0) {
        brightOnly = normalShaded;
    }
    else {
        brightOnly = vec4(0.0, 0.0, 0.0, 1.0);
    }
}`;

export default class BloomExtraction extends ShaderProgram {
	constructor(gl: WebGL2RenderingContext) {
		super(
			gl,
			"BloomExtraction",
			screenQuadVertexSrc,
			bloomExtractionFragmentSrc
		);

		this.use();

		this.setUniformLocation("inputTexture");

		this.gl.uniform1i(this.getUniformLocation("inputTexture")[0], 0);
	}

	setupVertexAttributePointers(): void {
		// Change if input layout changes in shaders
		const stride = 4 * 4;
		this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, stride, 0);
		this.gl.enableVertexAttribArray(0);

		this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, stride, 2 * 4);
		this.gl.enableVertexAttribArray(1);
	}
}
