import { Signal } from "@angular/core";

export interface ConsoleToolbarTemplateContext {
    console: {
        copyScreenshot(): Promise<void>;
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
    }
}
