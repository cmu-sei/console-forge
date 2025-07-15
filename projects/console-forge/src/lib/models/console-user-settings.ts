//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { ConsoleToolbarPosition } from "./console-toolbar-position"
import { ConsoleToolbarTheme } from "./console-toolbar-theme";

export interface ConsoleUserSettings {
    console: {
        allowCopyToLocalClipboard: boolean;
        attemptRemoteSessionResize: boolean;
        scaleToCanvasHostSize: boolean;
    }
    toolbar: {
        dockTo: ConsoleToolbarPosition;
        preferTheme: ConsoleToolbarTheme;
    }
}
