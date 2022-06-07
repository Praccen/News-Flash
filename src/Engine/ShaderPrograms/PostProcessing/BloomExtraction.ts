const bloomExtractionFragmentSrc: string = 
`#version 300 es
precision highp float;

in vec2 texCoords;

layout (location = 0) out vec4 normalShaded;
layout (location = 1) out vec4 brightOnly;

uniform sampler2D inputTexture;

void main() {
	normalShaded = texture(inputTexture, texCoords);
    
    // check whether fragment output is higher than threshold, if so output as brightness color
    float brightness = dot(normalShaded.rgb, vec3(0.2126, 0.7152, 0.0722));
    if(brightness > 0.4) { // Change this to 1.0 when having actual lights in the future
        brightOnly = normalShaded;
    }
    else {
        brightOnly = vec4(0.0, 0.0, 0.0, 1.0);
    }
}`;

class BloomExtraction extends ShaderProgram {
    constructor(gl: WebGL2RenderingContext) {
        super(gl, "BloomExtraction", screenQuadVertexSrc, bloomExtractionFragmentSrc);

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
};
