//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { Signal } from "@angular/core";
import { CanvasRecording } from "../services/canvas-recorder/canvas-recording";
import { ConsoleUserSettings } from "./console-user-settings";
import { ConsolePowerRequest } from "./console-power-request";
import { ConsoleSupportedFeatures } from "./console-supported-features";
import { ConsoleComponentNetworkConfig } from "./console-component-network-config";

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
        config: Signal<ConsoleComponentNetworkConfig | undefined>;
        connectionRequested(networkName: string): void;
        disconnectRequested(): void;
    };
    settings: {
        current: Signal<ConsoleUserSettings>;
        update(updateFn: (settings: ConsoleUserSettings) => ConsoleUserSettings): void;
    };
    state: {
        activeConsoleRecording: Signal<CanvasRecording | undefined>;
        isConnected: Signal<boolean>;
        isFullscreenAvailable: Signal<boolean>;
        isRecordingAvailable: Signal<boolean>;
    };
}
