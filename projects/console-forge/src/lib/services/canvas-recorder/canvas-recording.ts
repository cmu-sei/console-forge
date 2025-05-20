import { CanvasRecordingSettings } from "./canvas-recording-settings";

export class CanvasRecording {
    private readonly chunks: Blob[] = [];
    private readonly mimeType: string;
    private readonly recorder: MediaRecorder;
    private readonly window: Window;

    private autostopTimeoutRef?: number;

    // Stopping is a bit tricky.
    //
    // The MediaRecorder doesn't guarantee the validity of the emitted blob until `onstop` is fired. This means that when someone
    // calls in to stop the recording, we need to create a Promise that `.onstop` can resolve when it fires successfully. We store
    // the promise at the class level, because we should only ever have one of them (set when .stop` is called).
    private stopPromise?: Promise<Blob>;
    private stopResolveFn?: (blob: Blob) => void;

    public readonly settings: CanvasRecordingSettings;

    constructor(settings: CanvasRecordingSettings) {
        this.settings = settings;
        this.mimeType = settings.mimeType;
        this.recorder = new MediaRecorder(settings.stream, { mimeType: settings.mimeType });
        this.window = window;

        // pipe the output of the recorder into the local chunks array
        this.recorder.ondataavailable = ev => this.chunks.push(ev.data);
        this.recorder.onerror = (ev) => {
            throw (ev.error);
        }
        this.recorder.onstop = () => {
            if (this.stopResolveFn) {
                const blob = new Blob(this.chunks, { type: this.mimeType });
                this.stopResolveFn(blob);
                this.stopResolveFn = undefined;
            }
        }
        this.recorder.start(settings.chunkLength);

        this.autostopTimeoutRef = window.setTimeout(() => this.stop(), settings.maxDuration);
    }

    public stop(): Promise<Blob> {
        if (this.stopPromise) {
            // if defined, stop's already been called
            return this.stopPromise;
        }

        if (this.autostopTimeoutRef) {
            this.window.clearTimeout(this.autostopTimeoutRef);
            this.autostopTimeoutRef = undefined;
        }

        this.stopPromise = new Promise(resolve => this.stopResolveFn = resolve);

        this.recorder.stop();
        return this.stopPromise;
    }
}
