import { Directive, effect, ElementRef, inject } from '@angular/core';
import { UserSettingsService } from '../services/user-settings.service';

@Directive({ selector: '[cfApplyToolbarTheme]' })
export class ApplyToolbarThemeDirective {
  private readonly hostElement = inject(ElementRef<HTMLElement>);
  private readonly userSettings = inject(UserSettingsService).settings;

  constructor() {
    effect(() => {
      this.hostElement.nativeElement.setAttribute("data-theme", this.userSettings().toolbar.preferTheme);
    });
  }
}
