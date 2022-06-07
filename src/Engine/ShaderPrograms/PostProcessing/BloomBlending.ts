const bloomBlendingVertexSrc: string = 
`#version 300 es
layout (location = 0) in vec2 inPos;
layout (location = 1) in vec2 inTexCoords;

out vec2 texCoords;

void main()
{
    texCoords = inTexCoords;
    gl_Position = vec4(inPos, 0.0, 1.0); 
}`;

const bloomBlendingFragmentSrc: string = 
`#version 300 es
precision highp float;

out vec4 fragColor;
  
in vec2 texCoords;

uniform sampler2D scene;
uniform sampler2D bloomBlur;

void main()
{
    // const float gamma = 2.2;
    // const float exposure = 1.0;
    // vec3 hdrColor = texture(scene, texCoords).rgb;      
    // vec3 bloomColor = texture(bloomBlur, texCoords).rgb;
    // hdrColor += bloomColor; // additive blending
    // // tone mapping
    // vec3 result = vec3(1.0) - exp(-hdrColor * exposure);
    // // also gamma correct while we're at it       
    // result = pow(result, vec3(1.0 / gamma));
    // fragColor = vec4(result, 1.0);

    vec3 result = texture(scene, texCoords).rgb;      
    vec3 bloomColor = texture(bloomBlur, texCoords).rgb;
    result += bloomColor; // additive blending
    fragColor = vec4(result, 1.0);
}`;

class BloomBlending extends ShaderProgram {
    constructor(gl: WebGL2RenderingContext) {
        super(gl, "BloomBlending", bloomBlendingVertexSrc, bloomBlendingFragmentSrc);

        this.use();

        this.setUniformLocation("scene");
        this.setUniformLocation("bloomBlur");

        this.gl.uniform1i(this.getUniformLocation("scene")[0], 0);
        this.gl.uniform1i(this.getUniformLocation("bloomBlur")[0], 1);

        this.setUniformLocation("horizontal");
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
