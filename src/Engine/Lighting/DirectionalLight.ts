class DirectionalLight {
    direction: Vec3;
    colour: Vec3;
    ambientMultiplier: number;

    private gl: WebGL2RenderingContext;
    private shaderProgram: ShaderProgram;

    constructor(gl: WebGL2RenderingContext, shaderProgram: ShaderProgram) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;

        this.direction = new Vec3({x: 0.0, y: -1.0, z: 0.2});
        this.colour = new Vec3({x: 1.0, y: 1.0, z: 1.0});
        this.ambientMultiplier = 0.3;
    }

    bind() {
        this.gl.uniform3fv(this.shaderProgram.getUniformLocation("directionalLight.direction"), this.direction.elements());
        this.gl.uniform3fv(this.shaderProgram.getUniformLocation("directionalLight.colour"), this.colour.elements());
        this.gl.uniform1f(this.shaderProgram.getUniformLocation("directionalLight.ambientMultiplier"), this.ambientMultiplier);
    }
};