class Game {
    private gl: WebGL2RenderingContext;
    private rendering: Rendering;
    private ecsManager: ECSManager;

    private testEntity: Entity;

    gameOver: boolean;
    gameWon: boolean;
    gameLost: boolean;

    constructor(gl: WebGL2RenderingContext, rendering: Rendering, ecsManager: ECSManager) {
        this.gl = gl;
        this.rendering = rendering;
        this.ecsManager = ecsManager;

        this.rendering.useCrt = false;

        this.testEntity = this.createTestEntity();

        this.gameOver = false;
        this.gameWon = false;
        this.gameLost = false;

        this.rendering.camera.setPosition(0.0, 0.0, 5.5);

        // Load all textures to avoid loading mid game
        rendering.loadTextureToStore("https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png");
    }

    createTestEntity() {
        let entity = this.ecsManager.createEntity();
        this.ecsManager.addComponent(entity, new GraphicsComponent(this.rendering.getNewQuad("https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png")));
        this.ecsManager.addComponent(entity, new PositionComponent());
        // let movComp = new MovementComponent();
        // movComp.constantAcceleration.y = 0.0;
        // this.ecsManager.addComponent(entity, movComp);
        let cComp = new CollisionComponent();
        cComp.isConstraint = true;
        this.ecsManager.addComponent(entity, cComp);
        let ac = new AnimationComponent();
        // ac.spriteMap.setNrOfSprites(2, 1);
        // ac.startingTile = {x: 0, y: 0};
        // ac.advanceBy = {x: 1.0, y: 0.0};
        // ac.modAdvancement = {x: 2.0, y: 1.0};
        // ac.updateInterval = 0.5;
        // this.ecsManager.addComponent(entity, ac);

        return entity;
    }

    update(dt: number) {
        
        let moveVec: Vec3 = new Vec3();
        let move = false;
        if (input.keys["w"] ) {
            moveVec.add(this.rendering.camera.getDir());
            move = true;
        }

        if (input.keys["s"]) {
            moveVec.subtract(this.rendering.camera.getDir());
            move = true;
        }

        if (input.keys["a"]) {
            moveVec.subtract(this.rendering.camera.getRight());
            move = true;
        }

        if (input.keys["d"]) {
            moveVec.add(this.rendering.camera.getRight());
            move = true;
        }

        if (move) {
            moveVec.normalize();
            moveVec.multiply(5.0 * dt); // Speed
    
            this.rendering.camera.translate(moveVec.x, moveVec.y, moveVec.z);
        }

        let rotVec: Vec2 = new Vec2({x: 0.0, y: 0.0});
        let rotate = false;
        if (input.keys["ArrowUp"]) {
            rotVec.x += 1.0;
            rotate = true;
        }

        if (input.keys["ArrowDown"]) {
            rotVec.x -= 1.0;
            rotate = true;
        }

        if (input.keys["ArrowLeft"]) {
            rotVec.y += 1.0;
            rotate = true;
        }

        if (input.keys["ArrowRight"]) {
            rotVec.y -= 1.0;
            rotate = true;
        }

        if (rotate) {
            let rotMatrix = new Matrix4(null);
            let rotAmount: number = 90.0;
            let rightVec: Vec3 = new Vec3(this.rendering.camera.getRight());
            if (rotVec.y) {
                rotMatrix.rotate(rotAmount * rotVec.y * dt, 0.0, 1.0, 0.0);
            }
            if (rotVec.x) {
                rotMatrix.rotate(rotAmount * rotVec.x * dt, rightVec.x, rightVec.y, rightVec.z);
            }
            let oldDir = this.rendering.camera.getDir().vector3();
            let newDir = rotMatrix.multiplyVector3(oldDir);
            this.rendering.camera.setDir(newDir.elements[0], newDir.elements[1], newDir.elements[2]);
        }
    }
}
