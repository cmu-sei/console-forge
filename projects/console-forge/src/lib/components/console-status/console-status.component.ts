import { Component, input } from '@angular/core';
import { ConsoleConnectionStatus } from '../../models/console-connection-status';

@Component({
  selector: 'cf-console-status',
  imports: [],
  templateUrl: './console-status.component.html',
  styleUrl: './console-status.component.scss'
})
export class ConsoleStatusComponent {
  status = input.required<ConsoleConnectionStatus>();
}
