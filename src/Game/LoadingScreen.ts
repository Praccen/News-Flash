import Rendering from "../Engine/Rendering.js";
import Progress from "../Engine/GUI/Progress.js";
import State, { StatesEnum } from "../Engine/State.js";
import TextObject2D from "../Engine/GUI/Text/TextObject2D.js";
import { StateAccessible } from "./GameMachine.js";

export default class LoadingScreen extends State {
	private rendering: Rendering

    private text: TextObject2D;
	private progressBar: Progress;
    private progress: number;

	constructor(
			sa: StateAccessible
	) {
		super();
		this.rendering = new Rendering();

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

		this.text = this.rendering.getNew2DText();
        this.text.center = true;
		this.text.position.x = 0.5;
		this.text.position.y = 0.4;
		this.text.size = 50;
		this.text.textString = "Loading assets: 0%";
		
		this.progressBar = this.rendering.getNewProgress();
		this.progressBar.center = true;
		this.progressBar.position.x = 0.5;
		this.progressBar.position.y = 0.5;
		this.progressBar.size = 50;
		this.progressBar.getProgressElement().style.borderRadius = "4px";
        this.progressBar.getProgressElement().max = 1.0;
        this.progressBar.getProgressElement().value = 0.0;
        this.progress = 0;
	}

	async init() {
		super.init();
		this.progress = 0;
	}

	reset() {
		super.reset();
		this.rendering.hide();
	}

	update(dt: number) {
        this.progress += dt / 0.5;
        this.progressBar.getProgressElement().value = this.progress;
		this.text.textString = "Loading assets: " + Math.ceil((this.progress * 100)) + "%";

        if (this.progress > 1.0) {
            this.gotoState = StatesEnum.MAINMENU;
        }
	}

	draw() {
		this.rendering.draw();
	}
}
