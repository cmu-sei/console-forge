//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { ConsoleCredentials } from "./console-credentials";

export interface ConsoleConnectionOptions {
    autoFocusOnConnect?: boolean;
    backgroundStyle?: string;
    credentials?: ConsoleCredentials;
    hostElement: HTMLElement;
}
