//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { Component, input } from '@angular/core';
import { ConsoleConnectionStatus } from '../../models/console-connection-status';

@Component({
  selector: 'cf-console-status',
  templateUrl: './console-status.component.html',
  styleUrl: './console-status.component.scss'
})
export class ConsoleStatusComponent {
  status = input<ConsoleConnectionStatus | undefined>("disconnected");
}
