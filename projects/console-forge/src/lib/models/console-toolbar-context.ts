import { Signal } from "@angular/core";
import { CanvasRecording } from "../services/canvas-recorder/canvas-recording";
import { ConsoleUserSettings } from "./console-user-settings";
import { ConsolePowerRequest } from "./console-power-request";
import { ConsoleSupportedFeatures } from "./console-supported-features";

export interface ConsoleToolbarContext {
    console: {
        copyScreenshot(): Promise<void>;
        recordScreenStart(): void;
        recordScreenStop(): Promise<Blob>;
        sendCtrlAltDel(): Promise<void>;
        sendPowerRequest(request: ConsolePowerRequest): Promise<void>;
        sendTextToClipboard(text: string): Promise<void>;
        supportedFeatures: Signal<ConsoleSupportedFeatures>;
        toggleFullscreen(): Promise<void>;
    };
    networks: {
        connectionRequested(networkName: string): void;
        disconnectRequested(): void;
        current: Signal<string | undefined>;
        list: Signal<string[]>;
    };
    settings: {
        current: Signal<ConsoleUserSettings>;
        update(settings: Partial<ConsoleUserSettings>): Promise<void>;
    };
    state: {
        activeConsoleRecording: Signal<CanvasRecording | undefined>;
        isConnected: Signal<boolean>;
        isFullscreenAvailable: Signal<boolean>;
        isRecordingAvailable: Signal<boolean>;
    };
}
