class Camera {
    private gl: WebGL2RenderingContext;
    private pos: Vec3;
    private dir: Vec3;
    private fov: number;
    private ratio: number;
    private viewMatrixNeedsUpdate: boolean;
    private projMatrixNeedsUpdate: boolean;
    private viewMatrix: Matrix4;
    private projectionMatrix: Matrix4;
    private viewProjMatrix: Matrix4;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;

        // ----View----
		this.pos = new Vec3();
        this.dir = new Vec3({x: 0.0, y: 0.0, z: -1.0});
        this.viewMatrix = new Matrix4(null);
        this.viewMatrixNeedsUpdate = true;
        // ------------

        // ----Proj----
        this.projectionMatrix =  new Matrix4(null);
        this.projMatrixNeedsUpdate = true;
        this.ratio = 16.0/9.0;
        this.fov = 85.0;
        // ------------

        this.viewProjMatrix = new Matrix4(null);
	}

    getViewProjMatrix() {
        this.updateViewProjMatrix();
        return this.viewProjMatrix;
    }

    getPosition(): Vec3 {
        return this.pos;
    }

    getDir(): Vec3 {
        return this.dir;
    }

    getRight(): Vec3 {
        let returnVec: Vec3 = new Vec3(this.dir);
        let upVec: Vec3 = new Vec3({x: 0.0, y: 1.0, z: 0.0});
        returnVec.cross(upVec);
        returnVec.normalize();
        return returnVec;
    }

    setPosition(posX: number, posY: number, posZ?: number) {
        this.pos.x = posX;
        this.pos.y = posY;
        if (posZ) {
            this.pos.z = posZ;
        }
        this.viewMatrixNeedsUpdate = true;
    }

    translate(posX: number, posY: number, posZ: number) {
        this.pos.x += posX;
        this.pos.y += posY;
        this.pos.z += posZ;
        this.viewMatrixNeedsUpdate = true;
    }

    setDir(dirX: number, dirY: number, dirZ: number) {
        this.dir.x = dirX;
        this.dir.y = dirY;
        this.dir.z = dirZ;
        this.dir.normalize();
        this.viewMatrixNeedsUpdate = true;
    }

    setFOV(fov: number) {
        this.fov = fov;
        this.projMatrixNeedsUpdate = true;
    }

    setAspectRatio(ratio) {
        this.ratio = ratio;
        this.projMatrixNeedsUpdate = true;
    }

    private updateViewProjMatrix() {
        let updateViewProj = false;
        if (this.viewMatrixNeedsUpdate) {
            this.viewMatrix.setLookAt(this.pos.x, this.pos.y, this.pos.z,
                this.pos.x + this.dir.x, this.pos.y + this.dir.y, this.pos.z + this.dir.z,
                0.0, 1.0, 0.0);
            this.viewMatrixNeedsUpdate = false;
            updateViewProj = true;
        }

        if (this.projMatrixNeedsUpdate) {
            this.projectionMatrix.setPerspective(this.fov, this.ratio, 0.01, 1000.0);
            this.projMatrixNeedsUpdate = false;
            updateViewProj = true;
        }

        if (updateViewProj) {
            this.viewProjMatrix.set(this.projectionMatrix); 
            this.viewProjMatrix = this.viewProjMatrix.concat(this.viewMatrix);
        }
    }

    bindViewProjMatrix(uniformLocation: WebGLUniformLocation) {
        this.updateViewProjMatrix();
        
        this.gl.uniformMatrix4fv(uniformLocation, false, this.viewProjMatrix.elements);
    }
};