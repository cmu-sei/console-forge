//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { AfterViewInit, Component, effect, ElementRef, inject, input, output, signal, ViewEncapsulation } from '@angular/core';
import { ConsoleConnectionStatus } from '../../models/console-connection-status';
import { ConsoleVmPowerState } from '../../models/console-vm-power-state';
import { PicoCssService } from '../../services/pico-css.service';
import { ApplyToolbarThemeDirective } from '../../directives/apply-toolbar-theme.directive';

@Component({
  selector: 'cf-console-status',
  templateUrl: './console-status.component.html',
  styleUrl: './console-status.component.scss',
  imports: [ApplyToolbarThemeDirective],
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    "[class.vm-power-off]": "vmPowerState() === 'off'"
  }
})
export class ConsoleStatusComponent implements AfterViewInit {
  status = input<ConsoleConnectionStatus | undefined>("disconnected");
  vmPowerState = input<ConsoleVmPowerState>("unknown");

  powerOnRequest = output<void>();
  reconnectRequest = output<void>();

  private readonly picoCssService = inject(PicoCssService);
  private readonly hostElement = inject(ElementRef<HTMLElement>);

  // local UI feedback only: once the user asks for power on, we show progress until the consuming
  // app reports a power state other than "off"
  protected readonly isPowerOnPending = signal(false);

  constructor() {
    effect(() => {
      if (this.vmPowerState() !== "off") {
        this.isPowerOnPending.set(false);
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    // apply pico to the progress bar
    const sheet = await this.picoCssService.loadStyleSheet();

    if (this.hostElement.nativeElement.shadowRoot) {
      this.hostElement.nativeElement.shadowRoot.adoptedStyleSheets = [sheet];
    }
  }

  protected handlePowerOnClick(): void {
    this.isPowerOnPending.set(true);
    this.powerOnRequest.emit();
  }
}
