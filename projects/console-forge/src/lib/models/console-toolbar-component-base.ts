import { InputSignal } from "@angular/core";
import { ConsoleToolbarContext } from "../models/console-toolbar-context";

export interface ConsoleToolbarComponentBase {
    consoleContext: InputSignal<ConsoleToolbarContext>;
}
