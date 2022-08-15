import Vec2 from "../Physics/Vec2.js";
import GuiObject from "./GuiObject.js";

export default class Checkbox extends GuiObject {
    position: Vec2;
    textSize: number;
    
    private inputNode: HTMLInputElement;
    private label: HTMLLabelElement;

    constructor() {
        super();
        this.position = new Vec2();
        this.textSize = 42;

        // make a input node and a label node
        this.inputNode = document.createElement('input');
        this.inputNode.type = "checkbox";

        this.label = document.createElement('label');
        this.label.textContent = this.textString;

        this.div.appendChild(this.label);
        this.div.appendChild(this.inputNode);
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
        this.position2D = this.position;
        this.fontSize = this.textSize;
        this.label.textContent = this.textString;
        this.drawObject();
    }
}