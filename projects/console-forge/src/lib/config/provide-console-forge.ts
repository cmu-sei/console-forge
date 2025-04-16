import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { ConsoleForgeConfig, defaultCfConfig } from "./console-forge-config";
import { LoggerService } from "@/services/logger.service";

export function provideConsoleForge(config?: Partial<ConsoleForgeConfig>): EnvironmentProviders {
    // merge provided with defaults
    const finalConfig = {
        ...defaultCfConfig,
        ...config || {}
    };

    // provide to the env
    return makeEnvironmentProviders([
        {
            provide: LoggerService,
            useClass: LoggerService
        },
        {
            provide: ConsoleForgeConfig,
            useValue: finalConfig
        },
    ]);
}
