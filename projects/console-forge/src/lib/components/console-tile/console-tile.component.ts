import { Component, computed, effect, ElementRef, inject, input, viewChild } from '@angular/core';
import { ConsoleStatusComponent } from '../console-status/console-status.component';
import { ConsoleComponentConfig } from '../../models/console-component-config';
import { ConsoleClientService } from '../../services/console-clients/console-client.service';
import { ConsoleForgeConfig } from '../../config/console-forge-config';
import { ConsoleClientFactoryService } from '../../services/console-clients/console-client-factory.service';

@Component({
  selector: 'cf-console-tile',
  imports: [
    ConsoleStatusComponent
  ],
  templateUrl: './console-tile.component.html',
  styleUrl: './console-tile.component.scss'
})
export class ConsoleTileComponent {
  public config = input<ConsoleComponentConfig>();

  private readonly cfConfig = inject(ConsoleForgeConfig);
  private readonly consoleClientFactory = inject(ConsoleClientFactoryService);
  private readonly consoleClientType = computed(() => this.config()?.consoleClientType || this.cfConfig.defaultConsoleClientType);
  private readonly consoleHostElement = viewChild<ElementRef<HTMLElement>>("consoleHost");

  protected consoleClient?: ConsoleClientService;

  constructor() {
    effect(() => {
      if (this.config() && this.consoleHostElement() && !this.consoleClient) {
        this.connect(this.consoleHostElement()!.nativeElement);
      }
    });
  }

  private async connect(hostElement: HTMLElement) {
    const connectionConfig = this.config()!;

    if (!connectionConfig.url) {
      throw new Error("No url provided for console connection.");
    }

    if (!hostElement) {
      throw new Error("Couldn't resolve the console host before connection.");
    }

    this.consoleClient = this.consoleClientFactory.get(this.consoleClientType()!);
    await this.consoleClient.connect(connectionConfig.url, {
      autoFocusOnConnect: false,
      credentials: connectionConfig.credentials,
      hostElement: hostElement
    });

    this.consoleClient.setIsViewOnly(true);
  }
}
