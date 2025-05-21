import { Type } from "@angular/core";
import { LogLevel } from "../models/log-level";
import { ConsoleClientType } from "../models/console-client-type";
import { ConsoleToolbarComponentBase } from "../models/console-toolbar-component-base";
import { ConsoleToolbarDefaultComponent } from "../components/console-toolbar-default/console-toolbar-default.component";

export abstract class ConsoleForgeConfig {
    abstract canvasRecording: {
        chunkLength?: number;
        frameRate?: number;
        maxDuration?: number;
        mimeType?: string;
    };
    abstract consoleBackgroundStyle?: string;
    abstract consoleToolbarComponent: Type<ConsoleToolbarComponentBase>;
    abstract defaultConsoleClientType?: ConsoleClientType;
    abstract enableClipboard: boolean;
    abstract enableConsoleRecord: boolean;
    abstract logThreshold: LogLevel;
    abstract showBrowserNotificationsOnConsoleEvents: boolean;
}

export const defaultCfConfig: ConsoleForgeConfig = {
    canvasRecording: {
        chunkLength: 1000,
        frameRate: 25,
        maxDuration: 60000,
        mimeType: "video/webm"
    },
    consoleBackgroundStyle: "rgb(40, 40, 40)",
    consoleToolbarComponent: ConsoleToolbarDefaultComponent,
    enableClipboard: true,
    enableConsoleRecord: true,
    logThreshold: LogLevel.WARNING,
    showBrowserNotificationsOnConsoleEvents: false,
}
