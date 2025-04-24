import { Signal } from "@angular/core";

export interface ConsoleToolbarTemplateContext {
    console: {
        copyScreenshot(): Promise<void>;
        sendCtrlAltDel(): Promise<void>;
        sendTextToClipboard(text: string): Promise<void>;
        toggleFullscreen(): Promise<void>;
    },
    state: {
        isConnected: Signal<boolean>,
        isFullscreenAvailable: Signal<boolean>
    }
}
