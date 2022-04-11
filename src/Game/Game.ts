class Game {
    private gl: WebGL2RenderingContext;
    private rendering: Rendering;
    private ecsManager: ECSManager;

    gameOver: boolean;
    gameWon: boolean;
    gameLost: boolean;

    constructor(gl: WebGL2RenderingContext, rendering: Rendering, ecsManager: ECSManager) {
        this.gl = gl;
        this.rendering = rendering;
        this.ecsManager = ecsManager;

        this.rendering.camera.setZoom(0.2);
        this.rendering.useCrt = true;

        this.createTestEntity();

        this.gameOver = false;
        this.gameWon = false;
        this.gameLost = false;

        // Load all textures to avoid loading mid game
        rendering.loadTextureToStore("https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png");
    }

    createTestEntity() {
        let entity = this.ecsManager.createEntity();
        this.ecsManager.addComponent(entity, new GraphicsComponent(this.rendering.getNewQuad("https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png")));
        this.ecsManager.addComponent(entity, new PositionComponent());
        //this.ecsManager.addComponent(entity, new InputComponent());
        this.ecsManager.addComponent(entity, new MovementComponent());
        this.ecsManager.addComponent(entity, new CollisionComponent());
        let ac = new AnimationComponent();
        ac.spriteMap.setNrOfSprites(2, 1);
        ac.startingTile = {x: 0, y: 0};
        ac.advanceBy = {x: 1.0, y: 0.0};
        ac.modAdvancement = {x: 2.0, y: 1.0};
        ac.updateInterval = 0.5;
        this.ecsManager.addComponent(entity, ac);

        return entity;
    }

    update(dt: number) {
        
    }
}
