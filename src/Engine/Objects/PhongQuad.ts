// import {mat3} from "../../../libs/gl-matrix/gl-matrix";

class PhongQuad extends GraphicsObject {
    // Public
    modelMatrix: Matrix4; 
    normalMatrix: Matrix4;
    textureMatrix: Matrix4;
    diffuse: Texture;
    specular: Texture;

    // Private
    private vertices: Float32Array;
    private indices: Int32Array;
    

    constructor(gl: WebGL2RenderingContext, shaderProgram: ShaderProgram, diffuse: Texture, specular: Texture) {
        super(gl, shaderProgram);

        this.vertices = new Float32Array([ 
            // positions        // normals         // uv
            -0.5,  0.5,  0.0,   0.0, 0.0, 1.0,     0.0, 1.0,
            -0.5, -0.5,  0.0,   0.0, 0.0, 1.0,     0.0, 0.0,
             0.5, -0.5,  0.0,   0.0, 0.0, 1.0,     1.0, 0.0,
             0.5,  0.5,  0.0,   0.0, 0.0, 1.0,     1.0, 1.0,
        ]);
        this.indices = new Int32Array([
            0, 1, 2,
            0, 2, 3,
        ]);
        this.setVertexData(this.vertices);
        this.setIndexData(this.indices);

        this.diffuse = diffuse;
        this.specular = specular;

        this.modelMatrix = new Matrix4(null);
        this.textureMatrix = new Matrix4(null);
    }

    draw() {
        this.bindVAO();

        this.diffuse.bind();
        this.specular.bind();
        this.gl.uniformMatrix4fv(this.shaderProgram.getUniformLocation("modelMatrix"), false, this.modelMatrix.elements);
        // Calculate normal matrix and upload uniform - TODO: Add something to only do this when model matrix updates
        // let normalMatrix = mat3.create();
        // normalMatrix.fromValues(this.modelMatrix.elements[0], this.modelMatrix.elements[1], this.modelMatrix.elements[2],
        //     this.modelMatrix.elements[4], this.modelMatrix.elements[5], this.modelMatrix.elements[6],
        //     this.modelMatrix.elements[8], this.modelMatrix.elements[9], this.modelMatrix.elements[10]); // Not sure about the order
        // mat3.invert(normalMatrix, normalMatrix); // Might not work
        // mat3.transpose(normalMatrix, normalMatrix); // Might not work
        // let normMat = new Number[9];
        // normMat = normalMatrix; // Works?
        // for (let i = 0; i < 9; i++) {
        //     normMat[i] = normalMatrix[i];
        // }
        // this.gl.uniformMatrix3fv(this.shaderProgram.getUniformLocation("normalMatrix"), false, this.modelMatrix.elements); // Should be normalMatrix but can't get the mat3 stuff to work
        this.gl.uniformMatrix4fv(this.shaderProgram.getUniformLocation("textureMatrix"), false, this.textureMatrix.elements);

        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_INT, 0);
    }
};