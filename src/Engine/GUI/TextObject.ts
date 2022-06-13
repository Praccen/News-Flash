class TextObject {
    position: Vec2;
    size: number;
    scaleFontWithWindow: boolean;
    textString: string;
    
    private divContainerElement: HTMLElement;
    private div: HTMLDivElement;
    private textNode: Text;

    constructor() {
        this.position = new Vec2();
        this.size = 42;
        this.scaleFontWithWindow = true;
        this.textString = "";

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

    updatePositionAndString() {
        let style = getComputedStyle(this.divContainerElement);
        this.div.style.left = parseInt(style.paddingLeft) + this.position.x * parseInt(style.width) + "px";
        this.div.style.top = parseInt(style.paddingTop) + this.position.y * parseInt(style.height) + "px";
        if (this.scaleFontWithWindow) {
            this.div.style.fontSize = this.size * (parseInt(style.height) / 1080.0) + "px";
        } else {
            this.div.style.fontSize = this.size + "px";
        }
        this.textNode.nodeValue = this.textString;
    }
}