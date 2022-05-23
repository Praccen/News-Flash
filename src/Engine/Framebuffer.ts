class Framebuffer {
    // Public
    textures: Array<Texture>;
    rbo: WebGLRenderbuffer;

    // Private
    private gl: WebGL2RenderingContext;
    private fbo: WebGLFramebuffer;
    private width: number;
    private height: number;

    constructor(gl: WebGL2RenderingContext, width: number, height: number, colourAttachments: Array<{channels: number, dataStorageType: number}>, rbo?: WebGLFramebuffer) {
        this.gl = gl;
        this.width = width;
        this.height = height;

        this.fbo = this.gl.createFramebuffer();
        this.textures = new Array<Texture>(colourAttachments.length);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);

        let attachments = new Array<any>();
        for (let i = 0; i < colourAttachments.length; i++) {
            this.textures[i] = new Texture(this.gl, false, colourAttachments[i].channels, colourAttachments[i].dataStorageType);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[i].texture);
            this.textures[i].setTextureData(null, this.width, this.height);
            this.textures[i].setTexParameters(this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.textures[i].setTexParameters(this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0 + i, this.gl.TEXTURE_2D, this.textures[i].texture, 0);
            attachments.push(this.gl.COLOR_ATTACHMENT0 + i);
        }
    	this.gl.drawBuffers(attachments);

        if (rbo) {
            this.rbo = rbo;
        }
        else {
            this.rbo = this.gl.createRenderbuffer();
            this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.rbo);
            this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH24_STENCIL8, this.width, this.height); 
        }
        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.rbo); 

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
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.rbo);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH24_STENCIL8, width, height);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    bind(target: number) {
        this.gl.bindFramebuffer(target, this.fbo);
    }
};