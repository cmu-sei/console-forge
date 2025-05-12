import { Signal } from "@angular/core";
import { ConsoleToolbarPosition } from "./console-toolbar-position";
import { ConsoleToolbarOrientation } from "./console-toolbar-orientation";
import { CanvasRecording } from "../services/canvas-recorder/canvas-recording";

export interface ConsoleToolbarContext {
    console: {
        copyScreenshot(): Promise<void>;
        recordScreenStart(): void;
        recordScreenStop(): Promise<Blob>;
        sendCtrlAltDel(): Promise<void>;
        sendTextToClipboard(text: string): Promise<void>;
        toggleFullscreen(): Promise<void>;
    },
    networks: {
        connectionRequested(networkName: string): void;
        disconnectRequested(): void;
        current: Signal<string | undefined>;
        list: Signal<string[]>;
    },
    toolbar: {
        dockTo(toolbarPosition: ConsoleToolbarPosition): void;
        orientation: Signal<ConsoleToolbarOrientation>;
    }
    state: {
        activeConsoleRecording: Signal<CanvasRecording | undefined>;
        isConnected: Signal<boolean>;
        isFullscreenAvailable: Signal<boolean>;
        isRecordingAvailable: Signal<boolean>;
    }
}
