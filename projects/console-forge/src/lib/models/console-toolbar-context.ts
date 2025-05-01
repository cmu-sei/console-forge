import { Signal } from "@angular/core";
import { ConsoleToolbarPosition } from "./console-toolbar-position";
import { ConsoleToolbarOrientation } from "./console-toolbar-orientation";

export interface ConsoleToolbarContext {
    console: {
        copyScreenshot(): Promise<void>;
        recordScreen(): Promise<Blob>;
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
        isConnected: Signal<boolean>;
        isFullscreenAvailable: Signal<boolean>;
        isRecording: Signal<boolean>;
        isRecordingAvailable: Signal<boolean>;
    }
}
