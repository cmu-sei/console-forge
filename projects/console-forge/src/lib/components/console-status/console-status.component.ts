//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { AfterViewInit, Component, computed, ElementRef, inject, input, output, ViewEncapsulation } from '@angular/core';
import { ConsoleConnectionStatus } from '../../models/console-connection-status';
import { ConsoleVmPowerState } from '../../models/console-vm-power-state';
import { ConsoleVmActivity } from '../../models/console-vm-activity';
import { PicoCssService } from '../../services/pico-css.service';
import { ApplyToolbarThemeDirective } from '../../directives/apply-toolbar-theme.directive';

@Component({
  selector: 'cf-console-status',
  templateUrl: './console-status.component.html',
  styleUrl: './console-status.component.scss',
  imports: [ApplyToolbarThemeDirective],
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    "[class.vm-status-overlay]": "showOverlay()"
  }
})
export class ConsoleStatusComponent implements AfterViewInit {
  status = input<ConsoleConnectionStatus | undefined>("disconnected");
  vmPowerState = input<ConsoleVmPowerState>("unknown");
  vmActivity = input<ConsoleVmActivity | undefined>();

  powerOnRequest = output<void>();
  reconnectRequest = output<void>();

  private readonly picoCssService = inject(PicoCssService);
  private readonly hostElement = inject(ElementRef<HTMLElement>);

  protected readonly isBusy = computed(() => this.vmActivity()?.status === "active");
  protected readonly showOverlay = computed(() => this.status() !== "connected" &&
    (this.vmPowerState() === "off" || this.vmPowerState() === "suspended" || !!this.vmActivity()));
  protected readonly activityLabel = computed(() => {
    const activity = this.vmActivity();
    if (activity?.status === "failed") return activity.message || "The VM operation failed.";
    switch (activity?.kind) {
      case "starting": return "Starting VM…";
      case "migrating": return "Migrating VM…";
      case "busy": return "VM operation in progress…";
      default: return "Checking VM status…";
    }
  });

  async ngAfterViewInit(): Promise<void> {
    // apply pico to the progress bar
    const sheet = await this.picoCssService.loadStyleSheet();

    if (sheet && this.hostElement.nativeElement.shadowRoot) {
      this.hostElement.nativeElement.shadowRoot.adoptedStyleSheets = [sheet];
    }
  }

  protected handlePowerOnClick(): void {
    if (!this.isBusy() && this.vmPowerState() === "off") {
      this.powerOnRequest.emit();
    }
  }
}
