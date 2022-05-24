
const shadowVertexShaderSrc: string = 
`#version 300 es
// If inputs change, also update ShadowPass::setupVertexAttributePointers to match
layout (location = 0) in vec3 aPos;

uniform mat4 lightSpaceMatrix;
uniform mat4 modelMatrix;

void main()
{
    gl_Position = lightSpaceMatrix * model * vec4(aPos, 1.0);
}`;
    
const shadowFragmentShaderSrc: string = 
`#version 300 es
void main()
{
    
}`;

class ShadowPass extends ShaderProgram {
    constructor(gl: WebGL2RenderingContext) {
        super(gl, simpleVertexShaderSrc, simpleFragmentShaderSrc);

        this.use();

        this.setUniformLocation("lightSpaceMatrix");
        this.setUniformLocation("modelMatrix");
    }

    setupVertexAttributePointers(): void {
        // Change if input layout changes in shaders
        const stride = 3 * 4;
        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, stride, 0);
        this.gl.enableVertexAttribArray(0);
    }
};
