class Rendering {
	// public
	camera: Camera;

    useCrt: boolean;

	// private
	private gl: WebGL2RenderingContext;
    private textureStore: TextureStore;

	private simpleShaderProgram: SimpleShaderProgram;
	private crtShaderProgram: CrtShaderProgram;
	private screenQuadShaderProgram: ScreenQuadShaderProgram;
	// private phongShaderProgram: PhongShaderProgram;

	// Deferred rendering
	private geometryPass: GeometryPass;
	private lightingPass: LightingPass;
	private gBuffer: Framebuffer;
	private lightingQuad: ScreenQuad;

	private phongQuads: Array<PhongQuad>;

	private crtFramebuffer: Framebuffer;
	private crtQuad: ScreenQuad;

	private screenFramebuffer: Framebuffer;
	private screenQuad: ScreenQuad;

	private directionalLight: DirectionalLight;
	private pointLights: Array<PointLight>;

	private clearColour: {r:number, g:number, b:number, a:number};

	constructor(gl: WebGL2RenderingContext) {
		this.gl = gl;
        this.textureStore = new TextureStore(gl);
		this.camera = new Camera(gl);

        this.useCrt = true;

		this.crtShaderProgram = new CrtShaderProgram(this.gl);
		this.screenQuadShaderProgram = new ScreenQuadShaderProgram(this.gl);
		
		this.crtFramebuffer = new Framebuffer(this.gl, this.gl.canvas.width, this.gl.canvas.height, 1);
		this.crtQuad = new ScreenQuad(this.gl, this.crtShaderProgram, this.crtFramebuffer.textures);

		this.geometryPass = new GeometryPass(this.gl);
		this.lightingPass = new LightingPass(this.gl);
		this.gBuffer = new Framebuffer(this.gl, this.gl.canvas.width, this.gl.canvas.height, 3);
		this.lightingQuad = new ScreenQuad(this.gl, this.lightingPass, this.gBuffer.textures);

		this.screenFramebuffer = new Framebuffer(this.gl, this.gl.canvas.width, this.gl.canvas.height, 1);
		this.screenQuad = new ScreenQuad(this.gl, this.screenQuadShaderProgram, this.screenFramebuffer.textures);

		this.initGL();

		this.phongQuads = new Array<PhongQuad>();

		this.directionalLight = new DirectionalLight(this.gl, this.lightingPass);
		this.pointLights = new Array<PointLight>();
	}

	initGL() {
		this.clearColour = {r: 0.25, g: 0.2, b: 0.6, a: 1.0};
		this.gl.clearColor(this.clearColour.r, this.clearColour.g, this.clearColour.b, this.clearColour.a);
	
		// Enable depth test
		this.gl.enable(this.gl.DEPTH_TEST);
		
		//Enable alpha blending
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		
		// Disable faceculling
		this.gl.disable(this.gl.CULL_FACE);
	
		this.gl.lineWidth(3.0); // Sets line width of things like wireframe and draw lines
	}

    reportCanvasResize(x: number, y: number) {
		this.gBuffer.setProportions(x, y);
        this.crtFramebuffer.setProportions(x, y);
        this.screenFramebuffer.setProportions(x, y);
        console.log("X: " + x + " px " + "Y: " + y + " px");
    }

    loadTextureToStore(texturePath: string) {
        this.textureStore.getTexture(texturePath);
    }

	getNewPhongQuad(diffusePath: string, specularPath: string): PhongQuad {
		const length = this.phongQuads.push(new PhongQuad(this.gl, this.geometryPass, this.textureStore.getTexture(diffusePath), this.textureStore.getTexture(specularPath)));
		return this.phongQuads[length - 1];
	}

	getNewPointLight() {
		const length = this.pointLights.push(new PointLight(this.gl, this.lightingPass, this.pointLights.length));
		return this.pointLights[length - 1];
	}

	deletePhongQuad(quad: PhongQuad) {
		let index = this.phongQuads.findIndex(q => q == quad);
		if (index != -1) {
            this.phongQuads.splice(index, 1);
        }
	}

	draw() {
		// Clear the standard framebuffer
		this.gl.clearColor(this.clearColour.r, this.clearColour.g, this.clearColour.b, this.clearColour.a);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);
		this.gl.enable(this.gl.DEPTH_TEST);
		
		// Bind gbuffer and clear that with 0,0,0,0 (the alpha = 0 is important to be able to identify fragments in the lighting pass that have not been written with geometry)
		this.gBuffer.bind(this.gl.FRAMEBUFFER);
		this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);

		// ---- Geometry pass ----
		this.geometryPass.use();
		this.camera.bindViewProjMatrix(this.geometryPass.getUniformLocation("viewProjMatrix"));

		for (let phongQuad of this.phongQuads.values()) {
			phongQuad.draw();
		}
		// -----------------------

		// Geometry pass over, bind crt framebuffer if using crt effect, otherwise render directly to screen
		if (this.useCrt) {
			this.crtFramebuffer.bind(this.gl.FRAMEBUFFER);
			this.gl.clearColor(this.clearColour.r, this.clearColour.g, this.clearColour.b, this.clearColour.a);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);
		} else {
			this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null); // Render directly to screen
		}

		// Disable depth for screen quad(s) rendering
		this.gl.disable(this.gl.DEPTH_TEST); 

		// ---- Lighting pass ----
		this.lightingPass.use();

		this.gl.uniform3fv(this.lightingPass.getUniformLocation("camPos"), this.camera.getPosition().elements());
		this.directionalLight.bind();
		// Point lights
		this.gl.uniform1i(this.lightingPass.getUniformLocation("nrOfPointLights"),  this.pointLights.length);
		for (let pointLight of this.pointLights.values()) {
			pointLight.bind();
		}

		this.lightingQuad.draw();
		// -----------------------

		if (this.useCrt) {
			// ---- Crt effect ----
            this.screenFramebuffer.bind(this.gl.DRAW_FRAMEBUFFER); // Set screen framebuffer as output
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.crtShaderProgram.use();
            this.crtQuad.draw();
			// --------------------

            // Render to screen quad
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null); // Render directly to screen
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);

            this.screenQuadShaderProgram.use();
            this.screenQuad.draw();
		}
	}
};