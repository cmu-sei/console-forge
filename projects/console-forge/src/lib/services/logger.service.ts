//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { inject, Injectable } from '@angular/core';
import { LogLevel } from '../models/log-level';
import { ConsoleForgeConfig } from '../config/console-forge-config';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private libConfig = inject(ConsoleForgeConfig);

  // allow `any` here to mirror standard console.log behavior
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  log(logLevel: LogLevel, message: string, ...addl: any[]): void {
    const loggingFunction = this.resolveLoggingFunction(logLevel);

    if (logLevel >= this.libConfig.logThreshold) {
      loggingFunction(`ConsoleForge (${LogLevel[logLevel]}): ${message}`, ...addl);
    }
  }

  private resolveLoggingFunction(logLevel: LogLevel) {
    switch (logLevel) {
      case LogLevel.ERROR:
        return console.error;
      case LogLevel.WARNING:
        return console.warn;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.DEBUG:
        return console.debug;
      default:
        return console.log;
    }
  }
}
