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

    getViewMatrix() {
        return this.viewMatrix;
    }

    getPosition() {
        return this.pos;
    }

    setPosition(posX, posY, posZ?) {
        this.pos.x = posX;
        this.pos.y = posY;
        if (posZ) {
            this.pos.z = posZ;
        }
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

    bindViewProjMatrix(uniformLocation: WebGLUniformLocation) {
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
            this.viewProjMatrix = this.projectionMatrix;
            this.viewProjMatrix.concat(this.viewMatrix);
        }

        this.gl.uniformMatrix4fv(uniformLocation, false, this.viewProjMatrix.elements);
    }
};