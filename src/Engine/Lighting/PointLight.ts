import Vec3 from "../Physics/Vec3.js";
import ShaderProgram from "../ShaderPrograms/ShaderProgram.js";

export default class PointLight {
    position: Vec3;
	colour: Vec3;

	constant: number; 
	linear: number; 
	quadratic: number; 
	// private radius: number; // TODO: implement light volumes

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
        // this.radius = (-this.linear + Math.sqrt(this.linear * this.linear - 4.0 * this.quadratic * (this.constant - (256.0 / 5.0)))) / (2.0 * this.quadratic);
    }

    bind() {
        let ul = this.shaderProgram.getUniformLocation("pointLights[" + this.lightIndex + "].position");
        if (ul[1]) {
            this.gl.uniform3fv(ul[0], this.position.elements());
        }
        ul = this.shaderProgram.getUniformLocation("pointLights[" + this.lightIndex + "].colour");
        if (ul[1]) {
            this.gl.uniform3fv(ul[0], this.colour.elements());
        }

        ul = this.shaderProgram.getUniformLocation("pointLights[" + this.lightIndex + "].constant");
        if (ul[1]) {
            this.gl.uniform1f(ul[0], this.constant);
        }
        ul = this.shaderProgram.getUniformLocation("pointLights[" + this.lightIndex + "].linear");
        if (ul[1]) {
            this.gl.uniform1f(ul[0], this.linear);
        }
        ul = this.shaderProgram.getUniformLocation("pointLights[" + this.lightIndex + "].quadratic");
        if (ul[1]) {
            this.gl.uniform1f(ul[0], this.quadratic);
        }
    }
}