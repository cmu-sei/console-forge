//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { Type } from "@angular/core";
import { LogLevel } from "../models/log-level";
import { ConsoleClientType } from "../models/console-client-type";
import { ConsoleToolbarComponentBase } from "../models/console-toolbar-component-base";

export abstract class ConsoleForgeConfig {
    abstract canvasRecording: {
        autoDownloadCompletedRecordings?: boolean;
        chunkLength?: number;
        frameRate?: number;
        maxDuration?: number;
        mimeType?: string;
    };
    abstract consoleBackgroundStyle?: string;
    abstract defaultConsoleClientType?: ConsoleClientType;
    abstract disabledFeatures: {
        clipboard?: boolean;
        consoleScreenRecord?: boolean;
        manualConsoleReconnect?: boolean;
        networkDisconnection?: boolean;
    };
    abstract logThreshold: LogLevel;
    abstract showBrowserNotificationsOnConsoleEvents: boolean;
    abstract toolbar: {
        component: Type<ConsoleToolbarComponentBase>;
        disabled: boolean;
    }
}
