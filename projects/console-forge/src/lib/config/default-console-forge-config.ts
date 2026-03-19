//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { ConsoleForgeConfig } from "./console-forge-config";
import { ConsoleToolbarDefaultComponent } from "../components/console-toolbar-default/console-toolbar-default.component";
import { LogLevel } from "../models/log-level";

export const defaultCfConfig: ConsoleForgeConfig = {
    canvasRecording: {
        autoDownloadCompletedRecordings: true,
        chunkLength: 1000,
        frameRate: 25,
        maxDuration: 10000,
        mimeType: "video/webm"
    },
    consoleBackgroundStyle: "rgb(40, 40, 40)",
    disabledFeatures: {
        clipboard: false,
        consoleScreenRecord: false,
        manualConsoleReconnect: false,
        networkDisconnection: false,
    },
    logThreshold: LogLevel.WARNING,
    showBrowserNotificationsOnConsoleEvents: true,
    toolbar: {
        component: ConsoleToolbarDefaultComponent,
        disabled: false
    }
}
