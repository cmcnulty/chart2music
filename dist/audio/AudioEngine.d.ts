export declare enum AudioNotificationType {
    Annotation = "Annotation"
}
export interface AudioEngine {
    masterGain: number;
    playDataPoint(frequency: number, panning: number, duration: number): void;
    playNotification?(notificationType: AudioNotificationType, panning?: number, duration?: number): void;
}
