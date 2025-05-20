import { ConsoleToolbarPosition } from "./console-toolbar-position"

export interface ConsoleUserSettings {
    console: {
        allowCopyToLocalClipboard: boolean;
        preserveAspectRatioOnScale: boolean;
    }
    toolbar: {
        dockTo: ConsoleToolbarPosition;
    }
}
