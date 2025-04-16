import { ConsoleClientType } from "../../models/console-client-type";

export interface ConsoleComponentConfig {
    /**
     * Specifies the client that will be used to connect to the console (e.g. VNC, VMWare WMKS, etc.) Note that
     * you can configure a default for all ConsoleForge consoles in your app or module by using the `provideConsoleForgeConfig`
     * provider.
     */
    consoleClientType?: ConsoleClientType;

    /**
     * Makes the console non-interactable (view only). Defaults to false.
     */
    isViewOnly?: boolean;

    /**
     * The URL of the console's accessible web socket interface.
     */
    url: string;
}
