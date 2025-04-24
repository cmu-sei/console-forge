import { ConsoleCredentials } from "./console-credentials";

export interface ConsoleConnectionOptions {
    autoFocusOnConnect?: boolean;
    credentials?: ConsoleCredentials;
    hostElement: HTMLElement;
    isViewOnly?: boolean;
    scaleToContainerSize?: boolean;
}
