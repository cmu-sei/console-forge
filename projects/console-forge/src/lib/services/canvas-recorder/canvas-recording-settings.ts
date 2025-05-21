export interface CanvasRecordingSettings {
    id: string;
    stream: MediaStream;
    window: Window;
    mimeType: string;
    chunkLength: number;
    maxDuration: number;
    onStopCallback: () => void;
}
