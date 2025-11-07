import type { AudioEngine } from "./AudioEngine";
import { AudioNotificationType } from "./AudioEngine";
export declare class OscillatorAudioEngine implements AudioEngine {
    private readonly _audioContext;
    private readonly _masterCompressor;
    private readonly _masterGain;
    constructor(context: AudioContext);
    get masterGain(): number;
    set masterGain(value: number);
    playDataPoint(frequency: number, panning: number, duration?: number): void;
    playNotification?(notificationType: AudioNotificationType, panning?: number, duration?: number): void;
    private _playDataPoint;
    private _playAnnotation;
}
