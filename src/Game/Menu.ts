import Rendering from "../Engine/Rendering.js";
import Button from "../Engine/GUI/Button.js";
import Checkbox from "../Engine/GUI/Checkbox.js";
import TextObject2D from "../Engine/GUI/Text/TextObject2D.js";
import Slider from "../Engine/GUI/Slider.js";
import { options, StateAccessible } from "../main.js";
import State from "../Engine/State.js";

export default class Menu extends State {
	private rendering: Rendering

	private startButton: Button;
	private optionsButton: Button;

	constructor(
			sa: StateAccessible
	) {
		super();
		this.rendering = sa.rendering;

		// Load all textures to avoid loading mid game
		let textures = [
			"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/1200px-SNice.svg.png",
			"https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/371b6fdf-69a3-4fa2-9ff0-bd04d50f4b98/de8synv-6aad06ab-ed16-47fd-8898-d21028c571c4.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzM3MWI2ZmRmLTY5YTMtNGZhMi05ZmYwLWJkMDRkNTBmNGI5OFwvZGU4c3ludi02YWFkMDZhYi1lZDE2LTQ3ZmQtODg5OC1kMjEwMjhjNTcxYzQucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.wa-oSVpeXEpWqfc_bexczFs33hDFvEGGAQD969J7Ugw",
			"https://as2.ftcdn.net/v2/jpg/01/99/14/99/1000_F_199149981_RG8gciij11WKAQ5nKi35Xx0ovesLCRaU.jpg",
			"Assets/textures/fire.png",
			"Assets/textures/knight.png",
		];
		for (const texFile of textures) {
			this.rendering.loadTextureToStore(texFile);
		}

		this.startButton = this.rendering.getNewButton();
		this.startButton.position.x = 0.5;
		this.startButton.position.y = 0.46;
		this.startButton.center = true;
		this.startButton.textSize = 60;
		this.startButton.getInputElement().style.backgroundColor = "purple";
		this.startButton.getInputElement().style.color = "white";
		this.startButton.getInputElement().style.borderRadius = "4px";
		this.startButton.getInputElement().style.padding = "10px";
		this.startButton.textString = "Start";

		let self = this;
		this.startButton.onClick(function () {
			self.gotoState = 2;
		});

		this.optionsButton = this.rendering.getNewButton();
		this.optionsButton.position.x = 0.5;
		this.optionsButton.position.y = 0.6;
		this.optionsButton.center = true;
		this.optionsButton.textSize = 60;
		this.optionsButton.getInputElement().style.backgroundColor = "purple";
		this.optionsButton.getInputElement().style.color = "white";
		this.optionsButton.getInputElement().style.borderRadius = "4px";
		this.optionsButton.getInputElement().style.padding = "10px";
		this.optionsButton.textString = "Options";

		this.optionsButton.onClick(function () {
			self.gotoState = 1;
		});
	}

	update(dt: number) {
		
	}
}
