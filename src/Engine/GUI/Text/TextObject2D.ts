class TextObject2D extends GuiObject {
    position: Vec2;
    size: number;

    private textNode: Text;

    constructor() {
        super();

        this.position = new Vec3();
        this.size = 42;

        // make a text node for its content
        this.textNode = document.createTextNode("");
        this.div.appendChild(this.textNode);
    }

    draw(): void {
        this.position2D = this.position;
        this.fontSize = this.size;
        this.textNode.textContent = this.textString;
        this.drawObject();
    }
}