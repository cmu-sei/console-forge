import { ConsoleToolbarPosition } from "./console-toolbar-position"

export interface ConsoleUserSettings {
    console: {
        allowCopyToLocalClipboard: boolean;
        scaleToContainerSize: boolean;
    }
    toolbar: {
        dockTo: ConsoleToolbarPosition;
    }
}
