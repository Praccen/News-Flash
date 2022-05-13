class PointLight {
    position: Vec3;
	colour: Vec3;

	constant: number; 
	linear: number; 
	quadratic: number; 
	radius: number; 

    private gl: WebGL2RenderingContext;
    private shaderProgram: ShaderProgram;
    private lightIndex: number;

    constructor(gl: WebGL2RenderingContext, shaderProgram: ShaderProgram, lightIndex: number) {
        this.gl = gl;
        this.shaderProgram = shaderProgram;
        this.lightIndex = lightIndex;

        this.position = new Vec3({x: 0.0, y: 0.0, z: 0.0});
        this.colour = new Vec3({x: 1.0, y: 1.0, z: 1.0});

        this.constant = 1.0;
        this.linear = 0.07;
        this.quadratic = 0.017;
        this.radius = (-this.linear + Math.sqrt(this.linear * this.linear - 4.0 * this.quadratic * (this.constant - (256.0 / 5.0)))) / (2.0 * this.quadratic);

    }

    bind() {
        this.gl.uniform3fv(this.shaderProgram.getUniformLocation("pointLights[" + this.lightIndex + "].position"), this.position.elements());
        this.gl.uniform3fv(this.shaderProgram.getUniformLocation("pointLights[" + this.lightIndex + "].colour"), this.colour.elements());

        this.gl.uniform1f(this.shaderProgram.getUniformLocation("pointLights[" + this.lightIndex + "].constant"), this.constant);
        this.gl.uniform1f(this.shaderProgram.getUniformLocation("pointLights[" + this.lightIndex + "].linear"), this.linear);
        this.gl.uniform1f(this.shaderProgram.getUniformLocation("pointLights[" + this.lightIndex + "].quadratic"), this.quadratic);
        this.gl.uniform1f(this.shaderProgram.getUniformLocation("pointLights[" + this.lightIndex + "].radius"), this.radius);
    }
}