//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { AfterViewInit, Component, ElementRef, inject, input, output, ViewEncapsulation } from '@angular/core';
import { ConsoleConnectionStatus } from '../../models/console-connection-status';
import { PicoCssService } from '../../services/pico-css.service';
import { ApplyToolbarThemeDirective } from '../../directives/apply-toolbar-theme.directive';

@Component({
  selector: 'cf-console-status',
  templateUrl: './console-status.component.html',
  styleUrl: './console-status.component.scss',
  imports: [ApplyToolbarThemeDirective],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ConsoleStatusComponent implements AfterViewInit {
  status = input<ConsoleConnectionStatus | undefined>("disconnected");
  reconnectRequest = output<void>();

  private readonly picoCssService = inject(PicoCssService);
  private readonly hostElement = inject(ElementRef<HTMLElement>);

  async ngAfterViewInit(): Promise<void> {
    // apply pico to the progress bar
    const sheet = await this.picoCssService.loadStyleSheet();

    if (this.hostElement.nativeElement.shadowRoot) {
      this.hostElement.nativeElement.shadowRoot.adoptedStyleSheets = [sheet];
    }
  }
}
