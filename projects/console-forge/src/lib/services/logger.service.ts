import { inject, Injectable } from '@angular/core';
import { LogLevel } from '../models/log-level';
import { ConsoleForgeConfig } from '../config/console-forge-config';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private libConfig = inject(ConsoleForgeConfig);

  // allow any here to mirror standard console.log behavior
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  log(logLevel: LogLevel, message: string, ...addl: any[]): void {
    if (logLevel >= this.libConfig.logThreshold) {
      console.log(message, ...addl);
    }
  }
}
