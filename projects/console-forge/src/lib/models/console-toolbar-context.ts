import { Signal } from "@angular/core";

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
    }
    state: {
        isConnected: Signal<boolean>;
        isFullscreenAvailable: Signal<boolean>;
        isRecordingAvailable: Signal<boolean>;
    }
}
