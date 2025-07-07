//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { CanvasRecordingSettings } from "./canvas-recording-settings";

export class CanvasRecording {
    private readonly chunks: Blob[] = [];
    private readonly mimeType: string;
    private readonly recorder: MediaRecorder;
    private readonly window: Window;

    // Stopping is a bit tricky.
    //
    // The MediaRecorder doesn't guarantee the validity of the emitted blob until `onstop` is fired. This means that when someone
    // calls in to stop the recording, we need to create a (deferred) promise that `.onstop` can resolve when it fires successfully.
    //
    //
    // We store the promise at the class level, because we should only ever have one of them (set when .stop` is called). But we also
    // store the "resolve" call here, because its value is set in `.stop` but consumed in the `.onstop` event of the recorder.
    private stopPromise?: Promise<Blob>;
    private stopResolveFn?: (blob: Blob) => void;

    public readonly settings: CanvasRecordingSettings;

    constructor(settings: CanvasRecordingSettings) {
        this.settings = settings;
        this.mimeType = settings.mimeType;
        this.recorder = new MediaRecorder(settings.stream, { mimeType: settings.mimeType });
        this.window = settings.window;

        // pipe the output of the recorder into the local chunks array
        this.recorder.ondataavailable = ev => this.chunks.push(ev.data);
        this.recorder.onerror = (ev) => {
            throw (ev.error);
        }
        this.recorder.onstop = () => {
            // the "resolve" is set at the class level by the `.stop` method for access here
            if (this.stopResolveFn) {
                const blob = new Blob(this.chunks, { type: this.mimeType });
                this.stopResolveFn(blob);
                this.stopResolveFn = undefined;

                // the settings have an OnStop callback that should be invoked so
                // the service constructing these things can know if any are going on
                this.settings.onStopCallback();
            }
        }
        this.recorder.start(settings.chunkLength);
    }

    public stop(): Promise<Blob> {
        if (this.stopPromise) {
            // if defined, stop's already been called, so we 
            // want to give back the same promise
            return this.stopPromise;
        }

        // record the stop promise we're about to send back, so we can return it to
        // anyone who calls .stop again by mistake
        this.stopPromise = new Promise(resolve => this.stopResolveFn = resolve);

        // stop the recorder and return
        this.recorder.stop();
        return this.stopPromise;
    }
}
