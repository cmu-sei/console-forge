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
      dockTo: "left"
    }
  });

  public readonly settings = this._settings.asReadonly();

  private readonly settingsKey = "consoleForge:userSettings";
  private readonly window = inject(WINDOW);

  constructor() {
    // read out of storage
    const storedSettings: ConsoleUserSettings = JSON.parse(this.window.localStorage.getItem(this.settingsKey) || "{}");
    this.update(storedSettings);
  }

  update(value: Partial<ConsoleUserSettings>): void {
    const newSettings = {
      ...this.settings(),
      ...value
    };
    this.window.localStorage.setItem(this.settingsKey, JSON.stringify(newSettings));
    this._settings.update(() => newSettings);
  }
}
