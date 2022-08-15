import ShaderProgram from "../ShaderProgram.js";

const geometryVertexShaderSrc: string = 
`#version 300 es
// If inputs change, also update GeometryPass::setupVertexAttributePointers to match
layout (location = 0) in vec3 inPosition;
layout (location = 1) in vec3 inNormal;
layout (location = 2) in vec2 inTexCoords;

// If uniforms change, also update PhongShaderProgram to match
uniform mat4 modelMatrix;
uniform mat4 viewProjMatrix;
uniform mat4 textureMatrix;

out vec3 fragPos;
out vec3 fragNormal;
out vec2 texCoords;

void main() {
    vec4 worldPos = modelMatrix * vec4(inPosition, 1.0);
	texCoords = vec2(textureMatrix * vec4(inTexCoords, 0.0, 1.0));

	// Calculate normal matrix, should be done on CPU but I can't be bothered with implementing inverse of a matrix and don't want to find a good lib atm
	mat3 normalMatrix = mat3(modelMatrix);
	normalMatrix = inverse(normalMatrix);
	normalMatrix = transpose(normalMatrix);

	fragNormal = normalize(normalMatrix * inNormal);
	fragPos = worldPos.xyz;

    gl_Position = viewProjMatrix * worldPos;
}`;

const geometryFragmentShaderSrc: string = 
`#version 300 es
precision highp float;

in vec3 fragPos;
in vec3 fragNormal;
in vec2 texCoords;

layout (location = 0) out vec4 gPosition;
layout (location = 1) out vec4 gNormal;
layout (location = 2) out vec4 gColourSpec;

struct Material {
	sampler2D diffuse;
	sampler2D specular;
};

uniform Material material;

mat4 thresholdMatrix = mat4(
	1.0, 9.0, 3.0, 11.0,
	13.0, 5.0, 15.0, 7.0,
	4.0, 12.0, 2.0, 10.0,
	16.0, 8.0, 14.0, 6.0
	);

void main() {
	float opacity = texture(material.diffuse, texCoords).a;

	float threshold = thresholdMatrix[int(floor(mod(gl_FragCoord.x, 4.0)))][int(floor(mod(gl_FragCoord.y, 4.0)))] / 17.0;
    if (threshold >= opacity) {
        discard;
    }

	gColourSpec.rgb = texture(material.diffuse, texCoords).rgb;
    gColourSpec.a = texture(material.specular, texCoords).r;
	
	gPosition = vec4(fragPos, 1.0);
	gNormal = vec4(fragNormal, 1.0);
}`;

export default class GeometryPass extends ShaderProgram {
    constructor(gl: WebGL2RenderingContext) {
        super(gl, "GeometryPass", geometryVertexShaderSrc, geometryFragmentShaderSrc);

        this.use();

        this.setUniformLocation("modelMatrix");
        this.setUniformLocation("viewProjMatrix");
        this.setUniformLocation("textureMatrix");

        this.setUniformLocation("material.diffuse");
        this.setUniformLocation("material.specular");

        this.gl.uniform1i(this.getUniformLocation("material.diffuse")[0], 0);
        this.gl.uniform1i(this.getUniformLocation("material.specular")[0], 1);
    }

    setupVertexAttributePointers(): void {
        // Change if input layout changes in shaders
        const stride = 8 * 4;
        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, stride, 0);
        this.gl.enableVertexAttribArray(0);

        this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, false, stride, 3 * 4);
        this.gl.enableVertexAttribArray(1);

        this.gl.vertexAttribPointer(2, 2, this.gl.FLOAT, false, stride, 6 * 4);
        this.gl.enableVertexAttribArray(2);
    }
};
