import Vec3 from "./Maths/Vec3";
export default class Camera {
    private gl;
    private pos;
    private dir;
    private fov;
    private ratio;
    private viewMatrixNeedsUpdate;
    private projMatrixNeedsUpdate;
    private viewMatrix;
    private projectionMatrix;
    private viewProjMatrix;
    constructor(gl: WebGL2RenderingContext);
    getViewProjMatrix(): Matrix4;
    getViewMatrix(): Matrix4;
    getProjectionMatrix(): Matrix4;
    getPosition(): Vec3;
    getDir(): Vec3;
    getRight(): Vec3;
    setPosition(posX: number, posY: number, posZ?: number): void;
    translate(posX: number, posY: number, posZ: number): void;
    setDir(dirX: number, dirY: number, dirZ: number): void;
    setFOV(fov: number): void;
    setAspectRatio(ratio: any): void;
    private updateViewProjMatrix;
    bindViewProjMatrix(uniformLocation: WebGLUniformLocation, skybox?: boolean): void;
}
