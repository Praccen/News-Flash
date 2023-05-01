export default class SpriteMap {
    nrOfSprites: {
        x: number;
        y: number;
    };
    currentSprite: {
        x: number;
        y: number;
    };
    constructor();
    updateTextureMatrix(matrix: Matrix4): void;
    setNrOfSprites(x: number, y: number): void;
    setCurrentSprite(x: number, y: number): void;
    advanceSpriteBy(x: number, y: number): void;
}
