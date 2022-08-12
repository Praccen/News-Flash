class Rendering {
	// public
	camera: Camera;

	// ---- Post processing toggles ----
    useCrt: boolean;
	useBloom: boolean;
	// ---------------------------------

	// private
	private gl: WebGL2RenderingContext;
    private textureStore: TextureStore;
	private clearColour: {r:number, g:number, b:number, a:number};
	private resolutionWidth: number;
	private resolutionHeight: number;

	// ---- Simple shading ----
	private simpleShaderProgram: SimpleShaderProgram;
	// ------------------------

	// ---- Particles ----
	private particleShaderProgram: ParticleShaderProgram;
	private particleSpawners: Array<ParticleSpawner>;
	// -------------------

	// ---- Shadow mapping ----
	private shadowResolution: number;
	private shadowOffset: number;
	private shadowPass: ShadowPass;
	private shadowBuffer: Framebuffer;
	// ------------------------

	// ---- Deferred rendering ----
	private geometryPass: GeometryPass;
	private lightingPass: LightingPass;
	private gBuffer: Framebuffer;
	private lightingQuad: ScreenQuad;
	// ----------------------------

	// ---- Post processing ----
	// Crt effect
	private crtShaderProgram: CrtShaderProgram;
	private crtFramebuffer: Framebuffer;
	
	// Bloom
	private bloomExtraction: BloomExtraction;
	private bloomExtractionInputFramebuffer: Framebuffer;
	private bloomExtractionOutputFramebuffer: Framebuffer;
	private gaussianBlur: GaussianBlur;
	private pingPongFramebuffers: Array<Framebuffer>; // 2 frambuffers to go back and fourth between
	private bloomBlending: BloomBlending;

	// Screen quad to output the finished image on
	private screenQuadShaderProgram: ScreenQuadShaderProgram;
	private screenFramebuffer: Framebuffer;
	private screenQuad: ScreenQuad;
	// -------------------------

	// ---- Graphics objects ----
	private quads: Array<Quad>;
	private phongQuads: Array<PhongQuad>;
	private meshes: Array<Mesh>;
	// --------------------------

	// ---- Lights ----
	private directionalLight: DirectionalLight;
	private pointLights: Array<PointLight>;
	// ----------------

	// ---- GUI rendering ----
	private textObjects2D: Array<TextObject2D>;
	private textObjects3D: Array<TextObject3D>;
	private checkboxes: Array<Checkbox>;
	private buttons: Array<Button>;
	// -----------------------

	constructor(gl: WebGL2RenderingContext) {
		this.gl = gl;
        this.textureStore = new TextureStore(gl);
		this.camera = new Camera(gl);
		this.resolutionWidth = 1920;
		this.resolutionHeight = 1080;

		// ---- Simple shading ----
		this.simpleShaderProgram = new SimpleShaderProgram(this.gl);
		// ------------------------

		// ---- Particles ----
		this.particleShaderProgram = new ParticleShaderProgram(this.gl);
		this.particleSpawners = new Array<ParticleSpawner>();
		// -------------------

		// ---- Shadow mapping ----
		this.shadowResolution = 4096;
		this.shadowOffset = 20.0;
		this.shadowPass = new ShadowPass(this.gl);
		this.shadowBuffer = new Framebuffer(this.gl, this.shadowResolution, this.shadowResolution, true, []); // [{internalFormat: this.gl.RGBA, dataStorageType: this.gl.UNSIGNED_BYTE}]
		// ------------------------

		// ---- Deferred rendering ----
		this.geometryPass = new GeometryPass(this.gl);
		this.lightingPass = new LightingPass(this.gl);
		this.gBuffer = new Framebuffer(this.gl, this.resolutionWidth, this.resolutionHeight, false, [
			{internalFormat: this.gl.RGBA32F, dataStorageType: this.gl.FLOAT},
			{internalFormat: this.gl.RGBA32F, dataStorageType: this.gl.FLOAT},
			{internalFormat: this.gl.RGBA, dataStorageType: this.gl.UNSIGNED_BYTE}
		]);
		
		let textureArray = new Array<Texture>();
		for (let i = 0; i < this.gBuffer.textures.length; i++) {
			textureArray.push(this.gBuffer.textures[i]);
		}
		textureArray.push(this.shadowBuffer.depthTexture);
		this.lightingQuad = new ScreenQuad(this.gl, this.lightingPass, textureArray);
		// ----------------------------

		// ---- Post processing ----
		// Crt effect
        this.useCrt = true;
		this.crtShaderProgram = new CrtShaderProgram(this.gl);
		this.crtFramebuffer = new Framebuffer(this.gl, this.resolutionWidth, this.resolutionHeight, false, [{internalFormat: this.gl.RGBA, dataStorageType: this.gl.UNSIGNED_BYTE}]);

		// Bloom
		this.useBloom = true;
		this.bloomExtraction = new BloomExtraction(this.gl);
		this.bloomExtractionInputFramebuffer = new Framebuffer(this.gl, this.resolutionWidth, this.resolutionHeight, false, [{internalFormat: this.gl.RGBA, dataStorageType: this.gl.UNSIGNED_BYTE}]);
		this.bloomExtractionOutputFramebuffer = new Framebuffer(this.gl, this.resolutionWidth, this.resolutionHeight, false, 
			[{internalFormat: this.gl.RGBA, dataStorageType: this.gl.UNSIGNED_BYTE},
			{internalFormat: this.gl.RGBA, dataStorageType: this.gl.UNSIGNED_BYTE}]);
		this.gaussianBlur = new GaussianBlur(this.gl);
		this.pingPongFramebuffers = new Array<Framebuffer>(2);
		for (let i = 0; i < 2; i++) {
			this.pingPongFramebuffers[i] = new Framebuffer(this.gl, this.resolutionWidth, this.resolutionHeight, false, 
				[{internalFormat: this.gl.RGBA, dataStorageType: this.gl.UNSIGNED_BYTE}]);
		}
		this.bloomBlending = new BloomBlending(this.gl);

		// Screen quad to output the finished image on
		this.screenQuadShaderProgram = new ScreenQuadShaderProgram(this.gl);
		this.screenFramebuffer = new Framebuffer(this.gl, this.resolutionWidth, this.resolutionHeight, false, [{internalFormat: this.gl.RGBA, dataStorageType: this.gl.UNSIGNED_BYTE}]);
		this.screenQuad = new ScreenQuad(this.gl, this.screenQuadShaderProgram, this.screenFramebuffer.textures);
		// -------------------------
		
		// ---- Graphics objects ----
		this.quads = new Array<Quad>();
		this.phongQuads = new Array<PhongQuad>();
		this.meshes = new Array<Mesh>();
		// --------------------------
		
		// ---- Lights ----
		this.directionalLight = new DirectionalLight(this.gl, this.lightingPass);
		this.pointLights = new Array<PointLight>();
		// ----------------

		// ---- GUI rendering ----
		this.textObjects2D = new Array<TextObject2D>();
		this.textObjects3D = new Array<TextObject3D>();
		this.checkboxes = new Array<Checkbox>();
		this.buttons = new Array<Button>();
		// -----------------------

		this.initGL();
	}

	initGL() {
		this.clearColour = {r: 0.15, g: 0.1, b: 0.1, a: 1.0};
		this.gl.clearColor(this.clearColour.r, this.clearColour.g, this.clearColour.b, this.clearColour.a);
	
		// Enable depth test
		this.gl.enable(this.gl.DEPTH_TEST);
		
		//Enable alpha blending
		// this.gl.enable(this.gl.BLEND);
		// this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		this.gl.disable(this.gl.BLEND);
		
		// Disable faceculling
		this.gl.disable(this.gl.CULL_FACE);
	
		this.gl.lineWidth(3.0); // Sets line width
	}

    reportCanvasResize(x: number, y: number) {
		this.resolutionWidth = x;
		this.resolutionHeight = y;
		this.gBuffer.setProportions(x, y);
        this.crtFramebuffer.setProportions(x, y);
		this.bloomExtractionInputFramebuffer.setProportions(x, y);
		this.bloomExtractionOutputFramebuffer.setProportions(x, y);
		for (let buffer of this.pingPongFramebuffers) {
			buffer.setProportions(x, y);
		}
        this.screenFramebuffer.setProportions(x, y);
        // console.log("X: " + x + " px " + "Y: " + y + " px");
    }

    loadTextureToStore(texturePath: string) {
        this.textureStore.getTexture(texturePath);
    }

	getNewQuad(texturePath: string): Quad {
		const length = this.quads.push(new Quad(this.gl, this.simpleShaderProgram, this.textureStore.getTexture(texturePath)));
		return this.quads[length - 1];
	}

	getNewPhongQuad(diffusePath: string, specularPath: string): PhongQuad {
		const length = this.phongQuads.push(new PhongQuad(this.gl, this.geometryPass, this.textureStore.getTexture(diffusePath), this.textureStore.getTexture(specularPath)));
		return this.phongQuads[length - 1];
	}

	getNewMesh(objContent: string, diffusePath: string, specularPath: string) {
		const length = this.meshes.push(new Mesh(this.gl, this.geometryPass, objContent, this.textureStore.getTexture(diffusePath), this.textureStore.getTexture(specularPath)));
		return this.meshes[length - 1];
	}

	getNewPointLight(): PointLight {
		const length = this.pointLights.push(new PointLight(this.gl, this.lightingPass, this.pointLights.length));
		return this.pointLights[length - 1];
	}

	getNew2DText(): TextObject2D {
		const length = this.textObjects2D.push(new TextObject2D());
		return this.textObjects2D[length - 1];
	}

	getNew3DText(): TextObject3D {
		const length = this.textObjects3D.push(new TextObject3D());
		return this.textObjects3D[length - 1];
	}

	getNewCheckbox(): Checkbox{
		const length = this.checkboxes.push(new Checkbox());
		return this.checkboxes[length - 1];
	}

	getNewButton(): Button{
		const length = this.buttons.push(new Button());
		return this.buttons[length - 1];
	}

	getNewParticleSpawner(texturePath: string, numberOfStartingParticles: number = 0): ParticleSpawner {
		let length = this.particleSpawners.push(new ParticleSpawner(this.gl, this.particleShaderProgram, this.textureStore.getTexture(texturePath), numberOfStartingParticles));
		return this.particleSpawners[length - 1];
	}

	deleteQuad(quad: Quad) {
        let index = this.quads.findIndex(q => q == quad);
        if (index != -1) {
            this.quads.splice(index, 1);
        }
    }

	deletePhongQuad(quad: PhongQuad) {
		let index = this.phongQuads.findIndex(q => q == quad);
		if (index != -1) {
            this.phongQuads.splice(index, 1);
        }
	}

	draw() {
		this.gl.enable(this.gl.DEPTH_TEST);
		
		// ---- Shadow pass ----
		this.shadowPass.use();
		this.gl.viewport(0, 0, this.shadowResolution, this.shadowResolution);
		this.shadowBuffer.bind(this.gl.FRAMEBUFFER);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	
		//Set uniforms
		this.directionalLight.calcAndSendLightSpaceMatrix(this.camera.getPosition(), this.shadowOffset, this.shadowPass.getUniformLocation("lightSpaceMatrix")[0]);
		
		//Render shadow pass
		for (let phongQuad of this.phongQuads.values()) {
			phongQuad.changeShaderProgram(this.shadowPass);
			phongQuad.draw(false, false);
		}

		for (let mesh of this.meshes.values()) {
			mesh.changeShaderProgram(this.shadowPass);
			mesh.draw(false, false);
		}

		this.gl.viewport(0.0, 0.0, this.resolutionWidth, this.resolutionHeight);
		// ---------------------

		// Bind gbuffer and clear that with 0,0,0,0 (the alpha = 0 is important to be able to identify fragments in the lighting pass that have not been written with geometry)
		this.gBuffer.bind(this.gl.FRAMEBUFFER);
		this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);

		// ---- Geometry pass ----
		this.geometryPass.use();
		this.camera.bindViewProjMatrix(this.geometryPass.getUniformLocation("viewProjMatrix")[0]);

		for (let phongQuad of this.phongQuads.values()) {
			phongQuad.changeShaderProgram(this.geometryPass);
			phongQuad.draw();
		}

		for (let mesh of this.meshes.values()) {
			mesh.changeShaderProgram(this.geometryPass);
			mesh.draw();
		}
		// -----------------------

		// Geometry pass over, appropriate framebuffer for post processing or render directly to screen.
		if (this.useBloom) {
			this.bloomExtractionInputFramebuffer.bind(this.gl.DRAW_FRAMEBUFFER);
		} else if (this.useCrt) {
			this.crtFramebuffer.bind(this.gl.DRAW_FRAMEBUFFER);
		}
		else {
			this.gl.bindFramebuffer(this.gl.DRAW_FRAMEBUFFER, null); // Render directly to screen
		}

		// Clear the output with the actual clear colour we have set
		this.gl.clearColor(this.clearColour.r, this.clearColour.g, this.clearColour.b, this.clearColour.a);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);

		// Disable depth testing for screen quad(s) rendering
		this.gl.disable(this.gl.DEPTH_TEST); 

		// ---- Lighting pass ----
		this.lightingPass.use();

		this.gl.uniform3fv(this.lightingPass.getUniformLocation("camPos")[0], this.camera.getPosition().elements());
		this.directionalLight.bind();
		this.directionalLight.calcAndSendLightSpaceMatrix(this.camera.getPosition(), this.shadowOffset, this.lightingPass.getUniformLocation("lightSpaceMatrix")[0]);
		// Point lights
		this.gl.uniform1i(this.lightingPass.getUniformLocation("nrOfPointLights")[0],  this.pointLights.length);
		for (let pointLight of this.pointLights.values()) {
			pointLight.bind();
		}

		this.lightingQuad.draw();
		// -----------------------
		
		// ---- Simple shaded ----
		// Copy the depth buffer information from the gBuffer to the current depth buffer
		this.gBuffer.bind(this.gl.READ_FRAMEBUFFER);
		this.gl.blitFramebuffer(0, 0, this.resolutionWidth, this.resolutionHeight, 0, 0, this.resolutionWidth, this.resolutionHeight, this.gl.DEPTH_BUFFER_BIT, this.gl.NEAREST);

		// Enable depth testing again
		this.gl.enable(this.gl.DEPTH_TEST); 

		if (this.quads.length > 0) { // Only do this if there is something to simple shade
		
			this.simpleShaderProgram.use();
			this.camera.bindViewProjMatrix(this.simpleShaderProgram.getUniformLocation("viewProjMatrix")[0]);

			for (const quad of this.quads.values()) {
				quad.draw();
			}
		}
		// -----------------------

		// ---- Particles ----
		this.gl.enable(this.gl.DEPTH_TEST); 
		this.particleShaderProgram.use();
		this.camera.bindViewProjMatrix(this.particleShaderProgram.getUniformLocation("viewProjMatrix")[0]);
		this.gl.uniform3fv(this.particleShaderProgram.getUniformLocation("cameraPos")[0], this.camera.getPosition().elements());
		this.gl.uniform1f(this.particleShaderProgram.getUniformLocation("currentTime")[0], (Date.now() - applicationStartTime) * 0.001);
		for (const particleSpawner of this.particleSpawners.values()) {
			particleSpawner.draw();
		}
		// -------------------

		// ---- Post processing ----
		this.gl.disable(this.gl.DEPTH_TEST); 
		if (this.useBloom) {
			this.bloomExtractionOutputFramebuffer.bind(this.gl.DRAW_FRAMEBUFFER);
			this.bloomExtraction.use();
			this.bloomExtractionInputFramebuffer.textures[0].bind(0);
			this.screenQuad.draw(false);

			// Blur the bright image (second of the two in bloomExtractionOutputFramebuffer)
			let horizontal = true, firstIteration = true;
			let amount = 5;
			this.gaussianBlur.use();
			for (let i = 0; i < amount; i++)
			{
				this.pingPongFramebuffers[Number(horizontal)].bind(this.gl.DRAW_FRAMEBUFFER);
				this.gl.uniform1ui(this.gaussianBlur.getUniformLocation("horizontal")[0], Number(horizontal));
				if (firstIteration) {
					this.bloomExtractionOutputFramebuffer.textures[1].bind();
				}
				else {
					this.pingPongFramebuffers[Number(!horizontal)].textures[0].bind();
				}
				
				this.screenQuad.draw(false);
				horizontal = !horizontal;
				firstIteration = false;
			}

			// Combine the normal image with the blured bright image
			this.bloomBlending.use()
			this.bloomExtractionOutputFramebuffer.textures[0].bind(0); // Normal scene
			this.pingPongFramebuffers[Number(horizontal)].textures[0].bind(1); // Blurred bright image

			// Render result to screen or to crt framebuffer if doing crt effect after this.
			if (this.useCrt) {
				this.crtFramebuffer.bind(this.gl.DRAW_FRAMEBUFFER);
			} else {
				this.gl.bindFramebuffer(this.gl.DRAW_FRAMEBUFFER, null); // Render directly to screen
			}
			this.screenQuad.draw(false);
		}
	

		if (this.useCrt) {
			// ---- Crt effect ----
			this.gl.bindFramebuffer(this.gl.DRAW_FRAMEBUFFER, null); // Render directly to screen
            this.crtShaderProgram.use();
			this.crtFramebuffer.textures[0].bind(0);
            this.screenQuad.draw(false);
			// --------------------
		}
		// -------------------------

		// ---- Text rendering ----
		for (const text of this.textObjects3D) {
			text.draw(this.camera.getViewProjMatrix());
		}

		for (const text of this.textObjects2D) {
			text.draw();
		}

		for (const checkbox of this.checkboxes) {
			checkbox.draw();
		}

		for (const button of this.buttons) {
			button.draw();
		}
		// ------------------------

	}

	private renderTextureToScreen(texture: Texture) {
		this.gl.bindFramebuffer(this.gl.DRAW_FRAMEBUFFER, null); // Render directly to screen
		this.screenQuadShaderProgram.use();
		texture.bind();
		this.screenQuad.draw(false);
	}
};