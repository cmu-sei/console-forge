import { ConsoleCredentials } from "./console-credentials";

export interface ConsoleConnectionOptions {
    autoFocusOnConnect?: boolean;
    backgroundStyle?: string;
    credentials?: ConsoleCredentials;
    hostElement: HTMLElement;
}
