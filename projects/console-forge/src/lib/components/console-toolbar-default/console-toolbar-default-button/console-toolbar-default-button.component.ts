//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { Component, input, output } from '@angular/core';
import { ClassOnHoverDirective } from '../../../directives/class-on-hover.directive';

@Component({
  selector: 'cf-console-toolbar-default-button',
  imports: [ClassOnHoverDirective],
  templateUrl: './console-toolbar-default-button.component.html',
  styleUrl: './console-toolbar-default-button.component.scss'
})
export class ConsoleToolbarDefaultButtonComponent {
  public clicked = output<void>();
  public disabled = input(false);
  public label = input<string>();
  public isOngoing = input(false);
}
