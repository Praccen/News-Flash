class TextObject2D extends TextObject {
    position: Vec2;
    size: number;

    constructor() {
        super();

        this.position = new Vec3();
        this.size = 42;
    }

    draw(): void {
        this.position2D = this.position;
        this.fontSize = this.size;
        this.drawText();
    }
}