class DirectionalLight {
    direction: Vec3;
    colour: Vec3;
    ambientMultiplier: number;

    private gl: WebGL2RenderingContext;
    private shaderProgram: ShaderProgram;

    constructor(gl: WebGL2RenderingContext, shaderProgram: ShaderProgram) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;

        this.direction = new Vec3({x: 0.0, y: -1.0, z: -0.5});
        this.colour = new Vec3({x: 0.5, y: 0.5, z: 0.5});
        this.ambientMultiplier = 0.1;

    }

    bind() {
        this.gl.uniform3fv(this.shaderProgram.getUniformLocation("directionalLight.direction")[0], this.direction.normalize().elements());
        this.gl.uniform3fv(this.shaderProgram.getUniformLocation("directionalLight.colour")[0], this.colour.elements());
        this.gl.uniform1f(this.shaderProgram.getUniformLocation("directionalLight.ambientMultiplier")[0], this.ambientMultiplier);
    }

    calcAndSendLightSpaceMatrix(focusPos: Vec3, offset: number, uniformLocation: WebGLUniformLocation) {
        let cameraPos = new Vec3(focusPos);
        let offsetVec = new Vec3(this.direction).normalize().multiply(offset);
        let lightSpaceMatrix = new Matrix4(null).setOrtho(-50.0, 50.0, -50.0, 50.0, 0.1, offset * 2.0); // Start by setting it to projection
        cameraPos.subtract(offsetVec);
        let lightView = new Matrix4(null).setLookAt(cameraPos.x, cameraPos.y, cameraPos.z, focusPos.x, focusPos.y, focusPos.z, 0.0, 1.0, 0.0); // This will make it impossible to have exactly straight down shadows, but I'm fine with that
        lightSpaceMatrix = lightSpaceMatrix.concat(lightView); // Multiply with view
        this.gl.uniformMatrix4fv(uniformLocation, false, lightSpaceMatrix.elements);
    }    
};