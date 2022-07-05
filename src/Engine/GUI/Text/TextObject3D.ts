class TextObject3D extends TextObject {
    position: Vec3;
    size: number;
    scaleFontWithDistance: boolean;

    constructor() {
        super();

        this.position = new Vec3();
        this.size = 42;
        this.scaleFontWithDistance = true;
    }

    draw(viewProj: Matrix4): void {
        let pos = new Vector4([this.position.x, this.position.y, this.position.z, 1.0]);
        let screenCoords = viewProj.multiplyVector4(pos);
        screenCoords.elements[0] = (screenCoords.elements[0] / screenCoords.elements[3] + 1.0) / 2.0;
        screenCoords.elements[1] = 1.0 - ((screenCoords.elements[1] / screenCoords.elements[3] + 1.0) / 2.0);
        
        if (screenCoords.elements[2] > 0.0) {
            this.position2D.x = screenCoords.elements[0];
            this.position2D.y = screenCoords.elements[1];

            let size = this.size;
            if (this.scaleFontWithDistance) {
                size = this.size / screenCoords.elements[2];
            }
            this.fontSize = size;

            this.div.hidden = false;
            this.drawText();
        }
        else {
            this.div.hidden = true;
        }
    }
}