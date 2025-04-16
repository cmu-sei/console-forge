import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { ConsoleForgeConfig, defaultCfConfig } from "./console-forge-config";
import { LoggerService } from "@/services/logger.service";
import { ConsoleClientFactoryService } from "@/services/console-clients/console-client-factory.service";
import { UuidService } from "@/services/uuid.service";

export function provideConsoleForge(config?: Partial<ConsoleForgeConfig>): EnvironmentProviders {
    // merge provided with defaults
    const finalConfig = {
        ...defaultCfConfig,
        ...config || {}
    };

    // provide to the env
    return makeEnvironmentProviders([
        { provide: ConsoleClientFactoryService },
        { provide: LoggerService },
        { provide: UuidService },
        {
            provide: ConsoleForgeConfig,
            useValue: finalConfig
        },
    ]);
}
