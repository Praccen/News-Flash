
const shadowVertexShaderSrc: string = 
`#version 300 es
// If inputs change, also update ShadowPass::setupVertexAttributePointers to match
layout (location = 0) in vec3 inPosition;
layout (location = 1) in vec3 inNormal;
layout (location = 2) in vec2 inTexCoords;

uniform mat4 lightSpaceMatrix;
uniform mat4 modelMatrix;

void main()
{
    gl_Position = lightSpaceMatrix * modelMatrix * vec4(inPosition, 1.0);
}`;
    
const shadowFragmentShaderSrc: string = 
`#version 300 es
precision highp float;

//out vec4 final_colour;

void main()
{
    //final_colour = vec4(1.0, 1.0, 1.0, 1.0);
}`;

class ShadowPass extends ShaderProgram {
    constructor(gl: WebGL2RenderingContext) {
        super(gl, "ShadowPass", shadowVertexShaderSrc, shadowFragmentShaderSrc);

        this.use();

        this.setUniformLocation("lightSpaceMatrix");
        this.setUniformLocation("modelMatrix");
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
