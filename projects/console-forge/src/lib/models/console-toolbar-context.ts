//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { Signal } from "@angular/core";
import { CanvasRecording } from "../services/canvas-recorder/canvas-recording";
import { ConsolePowerRequest } from "./console-power-request";
import { ConsoleSupportedFeatures } from "./console-supported-features";
import { ConsoleComponentNetworkConfig } from "./console-component-network-config";
import { UserSettingsService } from "../services/user-settings.service";

export interface ConsoleToolbarContext {
    clipboard: {
        consoleClipboardText: Signal<string>;
        sendTextToConsoleClipboard(text: string): Promise<void>;
    };
    console: {
        copyScreenshot(): Promise<void>;
        recordScreenStart(): void;
        recordScreenStop(): Promise<Blob>;
        sendCtrlAltDel(): Promise<void>;
        sendKeyboardInput(text: string): Promise<void>;
        sendPowerRequest(request: ConsolePowerRequest): Promise<void>;
        supportedFeatures: Signal<ConsoleSupportedFeatures>;
        toggleFullscreen(): Promise<void>;
    };
    networks: {
        config: Signal<ConsoleComponentNetworkConfig | undefined>;
        connectionRequested(networkName: string): void;
        disconnectRequested(): void;
    };
    state: {
        activeConsoleRecording: Signal<CanvasRecording | undefined>;
        isConnected: Signal<boolean>;
        isFullscreenAvailable: Signal<boolean>;
        isRecordingAvailable: Signal<boolean>;
    };
    userSettings: UserSettingsService;
}
