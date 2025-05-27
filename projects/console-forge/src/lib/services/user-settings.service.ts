//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { inject, Injectable, signal } from '@angular/core';
import { ConsoleUserSettings } from '../models/console-user-settings';
import { WINDOW } from '../injection/window.injection-token';

@Injectable({ providedIn: 'root' })
export class UserSettingsService {
  private readonly _settings = signal<ConsoleUserSettings>({
    console: {
      allowCopyToLocalClipboard: true,
      preserveAspectRatioOnScale: true
    },
    toolbar: {
      dockTo: "top"
    }
  });
  public readonly settings = this._settings.asReadonly();

  private readonly settingsKey = "consoleForge:userSettings";
  private readonly window = inject(WINDOW);

  constructor() {
    // read out of storage
    const storedSettings: ConsoleUserSettings = JSON.parse(this.window.localStorage.getItem(this.settingsKey) || "{}");
    this._settings.update(() => storedSettings);
  }

  public update = this._settings.update;
}
