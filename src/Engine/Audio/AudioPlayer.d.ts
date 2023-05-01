export default class AudioPlayer {
    sounds: object;
    active: boolean;
    constructor();
    playSound(key: any, loop: any): void;
    setVolume(key: any, volume: any): void;
    setTime(key: any, time: any): void;
    pauseSound(key: any): void;
    stopAll(): void;
}
