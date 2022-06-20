class Game {
    private gl: WebGL2RenderingContext;
    private rendering: Rendering;
    private ecsManager: ECSManager;

    private particleText: TextObject;

    constructor(gl: WebGL2RenderingContext, rendering: Rendering, ecsManager: ECSManager) {
        this.gl = gl;
        this.rendering = rendering;
        this.ecsManager = ecsManager;

        this.rendering.useBloom = true;
        this.rendering.useCrt = false;

        // Load all textures to avoid loading mid game
        let smileyTexture = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png";
        rendering.loadTextureToStore(smileyTexture);
        let floorTexture = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/371b6fdf-69a3-4fa2-9ff0-bd04d50f4b98/de8synv-6aad06ab-ed16-47fd-8898-d21028c571c4.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzM3MWI2ZmRmLTY5YTMtNGZhMi05ZmYwLWJkMDRkNTBmNGI5OFwvZGU4c3ludi02YWFkMDZhYi1lZDE2LTQ3ZmQtODg5OC1kMjEwMjhjNTcxYzQucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.wa-oSVpeXEpWqfc_bexczFs33hDFvEGGAQD969J7Ugw";
        rendering.loadTextureToStore(floorTexture);
        let laserTexture = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/f04b32b4-58c3-4e24-a642-67320f0a66bb/ddwzap4-c0ad82e3-b949-479c-973c-11daaa55a554.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2YwNGIzMmI0LTU4YzMtNGUyNC1hNjQyLTY3MzIwZjBhNjZiYlwvZGR3emFwNC1jMGFkODJlMy1iOTQ5LTQ3OWMtOTczYy0xMWRhYWE1NWE1NTQucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.vSK6b4_DsskmHsiVKQtXQAospMA6_WZ2BoFYrODpFKQ";
        rendering.loadTextureToStore(laserTexture);

        this.createFloorEntity(floorTexture);

        for (let i = 0; i < 5; i++) {
            this.createTestEntity(new Vec3({x: -1.25 + i * 0.5, y: 0.0, z: -2.0}), -10.0 * i);
        }

        this.createPointLight(new Vec3({x: 0.0, y: 0.2, z: 0.0}), new Vec3({x: 5.0, y: 0.0, z: 0.0}));
        this.createPointLight(new Vec3({x: -4.0, y: 0.2, z: -10.0}), new Vec3({x: 2.7, y: 0.0, z: 4.0}));

        this.createParticleSpawner(new Vec3({x: -2.0, y: 1.0, z: 0.0}), 1000, 1.3, smileyTexture);

        this.rendering.camera.setPosition(0.0, 0.0, 5.5);

        let tempQuad = rendering.getNewQuad("https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png");

        let tempText = this.rendering.getNewText();
        tempText.textString = "HejHej";
        tempText.position.x = 0.9;
        tempText.position.y = 0.9;

        this.particleText = this.rendering.getNewText();
        this.particleText.textString = "This is a smiley fountain";
        this.particleText.getElement().style.color = "red";
        this.particleText.size = 24;
    }

    createFloorEntity(texturePath: string) {
        let entity = this.ecsManager.createEntity();
        let phongQuad = this.rendering.getNewPhongQuad(texturePath, texturePath);
        phongQuad.textureMatrix.setScale(50.0, 50.0, 1.0);
        this.ecsManager.addComponent(entity, new GraphicsComponent(phongQuad));
        let posComp = new PositionComponent(new Vec3({x: 0.0, y: -2.0, z: 0.0}));
        posComp.rotation.setValues(-90.0, 0.0, 0.0);
        posComp.scale.setValues(50.0, 50.0, 1.0);
        this.ecsManager.addComponent(entity, posComp);
    }

    createTestEntity(pos:Vec3 , rotX: number = 0.0) {
        let entity = this.ecsManager.createEntity();
        let smileyPath = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png";
        this.ecsManager.addComponent(entity, new GraphicsComponent(this.rendering.getNewPhongQuad(smileyPath, smileyPath)));
        let posComp = new PositionComponent(pos);
        posComp.rotation.setValues(rotX, 0.0, 0.0);
        this.ecsManager.addComponent(entity, posComp);

        // let ac = new AnimationComponent();
        // ac.spriteMap.setNrOfSprites(2, 1);
        // ac.startingTile = {x: 0, y: 0};
        // ac.advanceBy = {x: 1.0, y: 0.0};
        // ac.modAdvancement = {x: 2.0, y: 1.0};
        // ac.updateInterval = 0.5;
        // this.ecsManager.addComponent(entity, ac);

        return entity;
    }

    createPointLight(position: Vec3, colour: Vec3): PointLight {
        let pl = this.rendering.getNewPointLight();
        pl.position = position;
        pl.colour = colour;

        return pl;
    }

    createParticleSpawner(position: Vec3, numParticles: number, lifetime: number, texturePath: string) {
        let particleSpawner = this.rendering.getNewParticleSpawner(texturePath, numParticles);
        for (let i = 0; i < particleSpawner.getNumberOfParticles(); i++) {
            let rand = Math.random() * 2.0 * Math.PI;

            particleSpawner.setParticleData(i, 
                new Vec3(position),
                0.1,
                new Vec3({x: Math.cos(rand), y: 5.0 + Math.random() * 20.0, z: Math.sin(rand)}).normalize().multiply(8.0 + Math.random() * 3.0),
                new Vec3({x: 0.0, y: -4.0, z: 0.0})
                );
        }

        let entity = this.ecsManager.createEntity();
        this.ecsManager.addComponent(entity, new PositionComponent(position));
        let particleComp = new ParticleSpawnerComponent(particleSpawner);
        particleComp.lifetime = lifetime;
        this.ecsManager.addComponent(entity, particleComp);
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

        if (input.keys[" "]) {
            moveVec.add(new Vec3({x: 0.0, y: 1.0, z: 0.0}));
            move = true;
        }
        
        if (input.keys["Shift"]) {
            moveVec.subtract(new Vec3({x: 0.0, y: 1.0, z: 0.0}));
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

        let viewProj = this.rendering.camera.getViewProjMatrix();
        let spawnerPos = new Vector4([-2.0, 1.0, 0.0, 1.0]);
        let screenCoords = viewProj.multiplyVector4(spawnerPos);
        screenCoords.elements[0] = (screenCoords.elements[0] / screenCoords.elements[3] + 1.0) / 2.0;
        screenCoords.elements[1] = 1.0 - ((screenCoords.elements[1] / screenCoords.elements[3] + 1.0) / 2.0);
        this.particleText.size = 50.0 / screenCoords.elements[2];
        if (screenCoords.elements[2] > 0.0) {
            this.particleText.position.x = screenCoords.elements[0] - this.particleText.size * 0.004;
            this.particleText.position.y = screenCoords.elements[1];
            this.particleText.getElement().hidden = false;
        }
        else {
            this.particleText.getElement().hidden = true;
        }


    }
}
