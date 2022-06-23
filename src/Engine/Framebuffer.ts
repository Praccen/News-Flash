class Framebuffer {
    // Public
    textures: Array<Texture>;
    depthTexture: Texture;

    // Private
    private gl: WebGL2RenderingContext;
    private rbo: WebGLRenderbuffer;
    private fbo: WebGLFramebuffer;
    private width: number;
    private height: number;

    constructor(gl: WebGL2RenderingContext, width: number, height: number, createDepthAttachment: boolean, colourAttachments: Array<{internalFormat: number, dataStorageType: number}>) {
        this.gl = gl;
        this.width = width;
        this.height = height;

        this.fbo = this.gl.createFramebuffer();
        this.textures = new Array<Texture>(colourAttachments.length);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);

        let attachments = new Array<any>();
        for (let i = 0; i < colourAttachments.length; i++) {
            this.textures[i] = new Texture(this.gl, false, colourAttachments[i].internalFormat, this.gl.RGBA, colourAttachments[i].dataStorageType);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[i].texture);
            this.textures[i].setTextureData(null, this.width, this.height);
            this.textures[i].setTexParameters(this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.textures[i].setTexParameters(this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
			this.textures[i].setTexParameters(this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
			this.textures[i].setTexParameters(this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0 + i, this.gl.TEXTURE_2D, this.textures[i].texture, 0);
            attachments.push(this.gl.COLOR_ATTACHMENT0 + i);
        }

    	this.gl.drawBuffers(attachments);

        // More choices here would be good, not only texture or renderbuffer
        if (createDepthAttachment) {
            this.depthTexture = new Texture(this.gl, false, this.gl.DEPTH_COMPONENT32F, this.gl.DEPTH_COMPONENT, this.gl.FLOAT);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthTexture.texture);
            this.depthTexture.setTextureData(null, this.width, this.height);
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, this.depthTexture.texture, 0);
        } else {
            this.rbo = this.gl.createRenderbuffer();
            this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.rbo);
            this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_STENCIL, this.width, this.height); 
            
            this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_STENCIL_ATTACHMENT, this.gl.RENDERBUFFER, this.rbo); 
        }

        if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) != this.gl.FRAMEBUFFER_COMPLETE) {
            console.warn("ERROR::FRAMEBUFFER:: Framebuffer is not complete!");
        }

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    setProportions(width: number, height: number) {
        this.width = width;
        this.height = height;
        for (let texture of this.textures) {
            texture.setTextureData(null, this.width, this.height);
        }
        if (this.depthTexture) {
            this.depthTexture.setTextureData(null, this.width, this.height);
        }

        if (this.rbo)  {
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
            this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.rbo);
            this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH24_STENCIL8, width, height);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        }
    }

    bind(target: number) {
        this.gl.bindFramebuffer(target, this.fbo);
    }
};