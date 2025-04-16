import { LogLevel } from "../models/log-level";
import { ConsoleClientType } from "../models/console-client-type";

export abstract class ConsoleForgeConfig {
    abstract defaultConsoleClientType?: ConsoleClientType;
    abstract enableClipboard: boolean;
    abstract logThreshold: LogLevel;
}

export const defaultCfConfig: ConsoleForgeConfig = {
    enableClipboard: true,
    logThreshold: LogLevel.WARNING
}
