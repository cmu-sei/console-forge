import { ConsoleClientService } from '@/services/console-clients/console-client.service';
import { FullScreenService } from '@/services/full-screen.service';
import { Component, inject, input, output } from '@angular/core';

@Component({
  selector: 'cf-console-toolbar',
  imports: [],
  templateUrl: './console-toolbar.component.html',
  styleUrl: './console-toolbar.component.scss'
})
export class ConsoleToolbarComponent {
  consoleClient = input.required<ConsoleClientService>();
  toggleFullscreen = output<void>();

  // component state
  protected readonly fullscreenAvailable = inject(FullScreenService).isAvailable;

  handleFullscreen() {
    this.toggleFullscreen.emit();
  }
}
