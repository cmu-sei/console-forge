//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { AfterViewInit, Component, ElementRef, inject, input, output } from '@angular/core';
import { ClassOnHoverDirective } from '../../../directives/class-on-hover.directive';
import { PicoCssService } from '../../../services/pico-css.service';

@Component({
  selector: 'cf-console-toolbar-default-button',
  imports: [ClassOnHoverDirective],
  templateUrl: './console-toolbar-default-button.component.html',
  styleUrl: './console-toolbar-default-button.component.scss'
})
export class ConsoleToolbarDefaultButtonComponent implements AfterViewInit {
  public clicked = output<void>();
  public disabled = input(false);
  public label = input<string>();
  public isOngoing = input(false);

  private readonly picoCssService = inject(PicoCssService);
  private readonly hostElement = inject(ElementRef<HTMLElement>)

  async ngAfterViewInit(): Promise<void> {
    const sheet = await this.picoCssService.loadStyleSheet();

    if (this.hostElement.nativeElement.shadowRoot) {
      this.hostElement.nativeElement.shadowRoot.adoptedStyleSheets = [sheet];
    }
  }
}
