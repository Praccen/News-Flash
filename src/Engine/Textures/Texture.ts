class Texture {
    // Public
	width: number;
	height: number;
    texture: WebGLTexture;

    // Private
    private gl: WebGL2RenderingContext;
	private missingTextureData: Uint8Array;

    private channels: number;
    private dataStorageType: number;

    constructor(gl: WebGL2RenderingContext, channels:number = gl.RGBA, dataStorageType: number = gl.UNSIGNED_BYTE) {
        this.gl = gl;

        this.missingTextureData = new Uint8Array([
            255, 255, 255, 255, 0, 0, 0, 255,
            0, 0, 0, 255, 255, 255, 255, 255
        ]);

        this.channels = channels;
        this.dataStorageType = dataStorageType;

        // Generate texture
        this.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
    
        this.width = 1;
        this.height = 1;
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.channels, this.width, this.height, 0, this.gl.RGBA, this.dataStorageType, null);
    
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    setTextureData(data: Uint8Array, width: number, height: number) {
        this.width = width;
        this.height = height;
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.channels, width, height, 0, this.gl.RGBA, this.dataStorageType, data);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    updateTextureSubData(data: Uint8Array, xOffset: number, yOffset: number, width: number, height: number): boolean {
        if (xOffset + width <= this.width && yOffset + height <= this.height) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
            this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, xOffset, yOffset, width, height, this.channels, this.dataStorageType, data);
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            return true;
        }
        
        console.log("Tried to update texture sub data outside of bounds\n");
        return false;
    }

    bind(textureIndex: number = 0) {
        this.gl.activeTexture(this.gl.TEXTURE0 + textureIndex);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    }

    loadFromFile(URL: string) {
        let image = new Image();
        image.crossOrigin = "";
        image.src = URL;
        let self = this;
        texturesRequestedVsLoaded.req++;
        image.addEventListener('load', function() {
            // Now that the image has loaded copy it to the texture and save the width/height.
            self.width = image.width;
            self.height = image.height;
            self.gl.bindTexture(self.gl.TEXTURE_2D, self.texture);
            self.gl.texImage2D(self.gl.TEXTURE_2D, 0, self.channels, self.gl.RGBA, self.dataStorageType, image);
            self.gl.generateMipmap(self.gl.TEXTURE_2D);
            texturesRequestedVsLoaded.loaded++;
        });

    }

    setTexParameters(a: number, b: number) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, a, b);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }
};

// Texture::~Texture() {
// 	glDeleteTextures(1, &m_texture);
// }