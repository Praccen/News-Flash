class TextObject {
    protected position2D: Vec2;
    protected fontSize: number;
    scaleFontWithWindow: boolean;
    textString: string;
    centerText: boolean;
    
    private divContainerElement: HTMLElement;
    protected div: HTMLDivElement;
    private textNode: Text;

    constructor() {
        this.position2D = new Vec2();
        this.fontSize = 42;
        this.scaleFontWithWindow = true;
        this.textString = "";
        this.centerText = false;

        // look up the guicontainer
        this.divContainerElement = <HTMLElement>document.getElementById("guicontainer");
        
        // make the div
        this.div = document.createElement("div");
        
        // assign it a CSS class
        this.div.className = "floating-div";
        
        // make a text node for its content
        this.textNode = document.createTextNode("");
        this.div.appendChild(this.textNode);
        
        // add it to the divcontainer
        this.divContainerElement.appendChild(this.div);
    }

    getElement(): HTMLDivElement {
        return this.div;
    }

    protected drawText() {
        let style = getComputedStyle(this.divContainerElement);
        this.div.style.left = parseInt(style.paddingLeft) + this.position2D.x * parseInt(style.width) + "px";
        this.div.style.top = parseInt(style.paddingTop) + this.position2D.y * parseInt(style.height) + "px";
        if (this.scaleFontWithWindow) {
            this.div.style.fontSize = this.fontSize * (parseInt(style.height) / 1080.0) + "px";
        } else {
            this.div.style.fontSize = this.fontSize + "px";
        }
        this.textNode.nodeValue = this.textString;
        
        if (this.centerText) {
            this.div.style.transform = "translateX(-50%)";
        }
    }
}