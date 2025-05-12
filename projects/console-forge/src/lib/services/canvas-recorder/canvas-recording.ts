export class CanvasRecording {
    private readonly chunks: Blob[] = [];
    private readonly mimeType: string;
    private readonly recorder: MediaRecorder;
    private readonly window: Window;

    private autostopTimeoutRef?: number;
    private isRecording = true;

    constructor(stream: MediaStream, window: Window, mimeType = "video/webm", chunkSampleRate = 1000, maxDuration = 60000) {
        this.mimeType = mimeType;
        this.recorder = new MediaRecorder(stream, { mimeType });
        this.window = window;

        this.recorder.ondataavailable = ev => this.chunks.push(ev.data);
        this.recorder.onerror = (ev) => {
            this.isRecording = false;
            throw (ev.error);
        }
        this.recorder.start(chunkSampleRate);

        this.autostopTimeoutRef = window.setTimeout(() => this.stop(), maxDuration);
    }

    public stop(): Promise<Blob> {
        if (!this.isRecording) {
            throw new Error("Recording is already stopped.");
        }

        if (this.autostopTimeoutRef) {
            this.window.clearTimeout(this.autostopTimeoutRef);
            this.autostopTimeoutRef = undefined;
        }

        this.isRecording = false;
        return new Promise(resolve => resolve(new Blob(this.chunks, { type: this.mimeType })));
    }
}
