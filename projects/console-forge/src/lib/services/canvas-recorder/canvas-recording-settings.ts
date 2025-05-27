//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

export interface CanvasRecordingSettings {
    id: string;
    stream: MediaStream;
    window: Window;
    mimeType: string;
    chunkLength: number;
    maxDuration: number;
    onStopCallback: () => void;
}
