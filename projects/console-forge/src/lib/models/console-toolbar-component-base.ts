//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { InputSignal } from "@angular/core";
import { ConsoleToolbarContext } from "../models/console-toolbar-context";

export interface ConsoleToolbarComponentBase {
    consoleContext: InputSignal<ConsoleToolbarContext>;
}
