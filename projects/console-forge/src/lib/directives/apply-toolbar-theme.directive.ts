import { Directive, inject } from '@angular/core';
import { UserSettingsService } from '../services/user-settings.service';

@Directive({
  selector: '[cfApplyToolbarTheme]',
  // Null removes the attribute so the automatic color-scheme selector can apply.
  host: { '[attr.data-theme]': 'userSettings().toolbar.preferTheme ?? null' }
})
export class ApplyToolbarThemeDirective {
  protected readonly userSettings = inject(UserSettingsService).settings;
}
