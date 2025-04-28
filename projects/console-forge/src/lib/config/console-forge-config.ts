import { LogLevel } from "../models/log-level";
import { ConsoleClientType } from "../models/console-client-type";

export abstract class ConsoleForgeConfig {
    abstract consoleBackgroundStyle?: string;
    abstract defaultConsoleClientType?: ConsoleClientType;
    abstract enableClipboard: boolean;
    abstract logThreshold: LogLevel;
}

export const defaultCfConfig: ConsoleForgeConfig = {
    consoleBackgroundStyle: "rgb(40, 40, 40)",
    enableClipboard: true,
    logThreshold: LogLevel.WARNING
}
