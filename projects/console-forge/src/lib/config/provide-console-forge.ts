//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { ConsoleForgeConfig, defaultCfConfig } from "./console-forge-config";
import { ClipboardService } from "../services/clipboard/clipboard.service";
import { ConsoleClientFactoryService } from "../services/console-clients/console-client-factory.service";
import { FullScreenService } from "../services/full-screen.service";
import { LoggerService } from "../services/logger.service";
import { UserSettingsService } from "../services/user-settings.service";
import { UuidService } from "../services/uuid.service";
import { deepMerge, DeepPartial } from "../services/object.helpers";

export function provideConsoleForge(config?: DeepPartial<ConsoleForgeConfig>): EnvironmentProviders {
    // merge provided with defaults
    const finalConfig = config ? deepMerge(defaultCfConfig, config) : defaultCfConfig;

    // provide to the env
    return makeEnvironmentProviders([
        { provide: ClipboardService },
        { provide: ConsoleClientFactoryService },
        { provide: FullScreenService },
        { provide: LoggerService },
        { provide: UserSettingsService },
        { provide: UuidService },
        {
            provide: ConsoleForgeConfig,
            useValue: finalConfig
        },
    ]);
}
