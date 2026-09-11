import { Directive, effect, ElementRef, inject } from '@angular/core';
import { UserSettingsService } from '../services/user-settings.service';

@Directive({ selector: '[cfApplyToolbarTheme]' })
export class ApplyToolbarThemeDirective {
  private readonly hostElement = inject(ElementRef<HTMLElement>);
  private readonly userSettings = inject(UserSettingsService).settings;

  constructor() {
    effect(() => {
      const theme = this.userSettings().toolbar.preferTheme;
      if (theme) {
        this.hostElement.nativeElement.setAttribute("data-theme", theme);
      } else {
        // Pico's automatic scheme selector requires the attribute to be absent.
        this.hostElement.nativeElement.removeAttribute("data-theme");
      }
    });
  }
}
