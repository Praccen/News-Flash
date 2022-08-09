class Mesh extends GraphicsObject {
    // Public
    modelMatrix: Matrix4; 
    textureMatrix: Matrix4;
    diffuse: Texture;
    specular: Texture;

    // Private
    private vertices: Float32Array;

    constructor(gl: WebGL2RenderingContext, shaderProgram: ShaderProgram, objContent: String, diffuse: Texture, specular: Texture) {
        super(gl, shaderProgram);

        this.parseObjContent(objContent);

        this.setVertexData(this.vertices);

        this.diffuse = diffuse;
        this.specular = specular;

        this.modelMatrix = new Matrix4(null);
        this.textureMatrix = new Matrix4(null);
    }

    private parseObjContent(objContent: String) {
        /*
        https://webglfundamentals.org/webgl/lessons/webgl-load-obj.html
        */
        const lines = objContent.split('\n');
        let vertexPositions = new Array<Vec3>();
        let vertexTexCoords = new Array<Vec2>();
        let vertexNormals = new Array<Vec3>();
        let vertices = new Array<{posIndex: number, texCoordIndex: number, normalIndex: number}>();
        for (const line of lines) {
            if (line.includes("v ")) { // Position
                const coords = line.split(" ").filter((element) => {return element != ""});
                vertexPositions.push(new Vec3({x: coords[1], y: coords[2], z: coords[3]}));
            }
            else if (line.includes("vt" )) { // Texture coordinates
                const coords = line.split(" ").filter((element) => {return element != ""});
                vertexTexCoords.push(new Vec2({x: coords[1], y: coords[2]}));
            }
            else if (line.includes("vn ")) { // Normal
                const coords = line.split(" ").filter((element) => {return element != ""});
                vertexNormals.push(new Vec3({x: coords[1], y: coords[2], z: coords[3]}));
            }
            else if (line.includes("f ")) { // Faces
                const coords = line.split(" ").filter((element) => {return element != ""});
                for (let i = 1; i < coords.length - 2; i++) {
                    for (let j = 0; j < 3; j++) {
                        const indices = coords[i + j].split("/");
                        vertices.push({posIndex: parseInt(indices[0]) - 1, texCoordIndex: parseInt(indices[1]) - 1, normalIndex: parseInt(indices[2]) - 1});
                    }
                }
            }
        }
        
        this.vertices = new Float32Array(vertices.length * 8); // 3 * pos + 2 * tx + 3 * norm 

        for (let i = 0; i < vertices.length; i++) {
            this.vertices[i * 8] = vertexPositions[vertices[i].posIndex].x;
            this.vertices[i * 8 + 1] = vertexPositions[vertices[i].posIndex].y;
            this.vertices[i * 8 + 2] = vertexPositions[vertices[i].posIndex].z;
            
            this.vertices[i * 8 + 3] = vertexTexCoords[vertices[i].texCoordIndex].x;
            this.vertices[i * 8 + 4] = vertexTexCoords[vertices[i].texCoordIndex].y;

            this.vertices[i * 8 + 5] = vertexNormals[vertices[i].normalIndex].x;
            this.vertices[i * 8 + 6] = vertexNormals[vertices[i].normalIndex].y;
            this.vertices[i * 8 + 7] = vertexNormals[vertices[i].normalIndex].z;
        }

    }

    draw(bindDiffuse: boolean = true, bindBoth: boolean = true) {
        this.bindVAO();

        if (bindDiffuse || bindBoth) {
            this.diffuse.bind(0);
        }
        
        if (bindBoth) {
            this.specular.bind(1);
        }
        
        let modelReturn: [WebGLUniformLocation, boolean] = this.shaderProgram.getUniformLocation("modelMatrix");
        if (modelReturn[1]) {
            this.gl.uniformMatrix4fv(modelReturn[0], false, this.modelMatrix.elements);
        }
        let textureReturn: [WebGLUniformLocation, boolean] = this.shaderProgram.getUniformLocation("textureMatrix");
        if (textureReturn[1]) {
            this.gl.uniformMatrix4fv(textureReturn[0], false, this.textureMatrix.elements);
        }

        // this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_INT, 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.length / 8);
    }
}