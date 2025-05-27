//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { ConsoleCredentials } from "../../models/console-credentials";
import { ConsoleClientType } from "../../models/console-client-type";

export interface ConsoleComponentConfig {
    /**
     * If true, the client will attempt to set control focus on the console session after connection. Defaults to false.
     */
    autoFocusOnConnect?: boolean;

    /**
     * Specifies the client that will be used to connect to the console (e.g. VNC, VMWare WMKS, etc.) Note that
     * you can configure a default for all ConsoleForge consoles in your app or module by using the `provideConsoleForgeConfig`
     * provider.
     */
    consoleClientType?: ConsoleClientType;

    /**
     * An optional username, password, or sessionId to use to authenticate to the console. Configuration here is specific
     * to the protocol being used and the configuration of the target virtual console. See ConsoleForge's documentation
     * for details.
     */
    credentials?: ConsoleCredentials;

    /**
     * A list of networks the console user can request the VM to connect to. 
     */
    initialAvailableNetworks?: string[];

    /**
     * The URL of the console's accessible web socket interface.
     */
    url: string;
}
