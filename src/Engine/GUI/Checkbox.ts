class Checkbox {
    position: Vec2;
    textString: string;
    
    private divContainerElement: HTMLElement;
    protected div: HTMLDivElement;
    private inputNode: HTMLInputElement;
    private label: HTMLLabelElement;

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
        this.inputNode.type = "checkbox";

        this.label = document.createElement('label');
        this.label.textContent = this.textString;

        this.div.appendChild(this.label);
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

    getChecked(): boolean {
        return this.inputNode.checked;
    }

    draw() {
        let style = getComputedStyle(this.divContainerElement);
        this.div.style.left = parseInt(style.paddingLeft) + this.position.x * parseInt(style.width) + "px";
        this.div.style.top = parseInt(style.paddingTop) + this.position.y * parseInt(style.height) + "px";
        this.label.textContent = this.textString;
    }
}