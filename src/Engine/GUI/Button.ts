class Button {
    position: Vec2;
    textString: string;
    
    private divContainerElement: HTMLElement;
    protected div: HTMLDivElement;
    private inputNode: HTMLInputElement;

    constructor() {
        this.position = new Vec2();
        this.textString = "";

        // look up the guicontainer
        this.divContainerElement = <HTMLElement>document.getElementById("guicontainer");
        
        // make the div
        this.div = document.createElement("div");
        
        // assign it a CSS class
        this.div.className = "floating-div";
        
        // make a input node and a label node
        this.inputNode = document.createElement('input');
        this.inputNode.type = "button";

        this.div.appendChild(this.inputNode);
        
        // add it to the divcontainer
        this.divContainerElement.appendChild(this.div);
    }

    getElement(): HTMLDivElement {
        return this.div;
    }

    getInputElement(): HTMLInputElement {
        return this.inputNode;
    }

    draw() {
        let style = getComputedStyle(this.divContainerElement);
        this.div.style.left = parseInt(style.paddingLeft) + this.position.x * parseInt(style.width) + "px";
        this.div.style.top = parseInt(style.paddingTop) + this.position.y * parseInt(style.height) + "px";
        this.inputNode.value = this.textString;
    }
}