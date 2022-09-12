import Vec2 from "../Maths/Vec2.js";
import GuiObject from "./GuiObject.js";

export default class Button extends GuiObject {
    position: Vec2;
    
    private inputNode: HTMLInputElement;

    constructor() {
        super();
        this.position = new Vec2();
        
        // make an input node and a label node
        this.inputNode = document.createElement('input');
        this.inputNode.type = "button";

        this.div.appendChild(this.inputNode);
    }

    getElement(): HTMLDivElement {
        return this.div;
    }

    getInputElement(): HTMLInputElement {
        return this.inputNode;
    }

    draw() {
        this.position2D = this.position;
        this.inputNode.value = this.textString;

        this.drawObject();
    }
}