//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { effect, inject, Injectable, signal } from '@angular/core';
import { ConsoleUserSettings } from '../models/console-user-settings';
import { WINDOW } from '../injection/window.injection-token';
import { deepMerge, DeepPartial } from "./object.helpers";
import { LoggerService } from './logger.service';
import { LogLevel } from '../models/log-level';

@Injectable({ providedIn: 'root' })
export class UserSettingsService {
  private readonly _settings = signal<ConsoleUserSettings>({
    console: {
      allowCopyToLocalClipboard: true,
      attemptRemoteSessionResize: true,
      scaleToCanvasHostSize: true,
    },
    toolbar: {
      dockTo: "left",
      preferTheme: undefined
    }
  });
  public readonly settings = this._settings.asReadonly();

  private readonly logger = inject(LoggerService);
  private readonly settingsKey = "consoleForge:userSettings";
  private readonly window = inject(WINDOW);

  constructor() {
    // read out of storage
    const storedValue = this.window.localStorage.getItem(this.settingsKey);

    if (storedValue) {
      try {
        const parsedValue: Partial<ConsoleUserSettings> = JSON.parse(storedValue);
        this._settings.update(current => ({ ...current, ...parsedValue }));
      }
      catch (err) {
        this.logger.log(LogLevel.WARNING, "Couldn't load settings from local storage:", err);

      }
    }

    // when settings are written, update local storage
    effect(() => {
      const current = this._settings();
      this.window.localStorage.setItem(this.settingsKey, JSON.stringify(current));
      this.logger.log(LogLevel.DEBUG, "Settings saved to local storage.");
    });
  }

  public patch(patch: DeepPartial<ConsoleUserSettings>) {
    this._settings.update(current => deepMerge(current, patch));
  }

  public update(update: Partial<ConsoleUserSettings>) {
    this._settings.update(current => ({
      ...current,
      ...update
    }));
  }
}
