import { Component, computed, effect, ElementRef, inject, input, viewChild } from '@angular/core';
import { ConsoleComponentConfig } from './console-component-config';
import { ConsoleClientService } from '@/services/console-clients/console-client.service';
import { ConsoleClientFactoryService } from '@/services/console-clients/console-client-factory.service';
import { ConsoleForgeConfig } from '@/config/console-forge-config';
import { UuidService } from '@/services/uuid.service';
import { LoggerService } from '@/services/logger.service';
import { ConsoleToolbarComponent } from '../console-toolbar/console-toolbar.component';
import { FullScreenService } from '@/services/full-screen.service';

@Component({
  selector: 'cf-console',
  standalone: true,
  imports: [
    ConsoleToolbarComponent
  ],
  styleUrl: './console.component.scss',
  templateUrl: './console.component.html',
})
export class ConsoleComponent {
  // component I/O
  config = input.required<ConsoleComponentConfig>();
  status = computed(() => this.consoleClient?.connectionStatus());

  // services
  private consoleClientFactory = inject(ConsoleClientFactoryService);
  private consoleForgeConfig = inject(ConsoleForgeConfig);
  private fullscreen = inject(FullScreenService);
  private logger = inject(LoggerService);
  private uuids = inject(UuidService);

  // viewkids
  protected componentContainer = viewChild.required<ElementRef<HTMLElement>>("componentContainer");
  protected consoleHostElement = viewChild.required<ElementRef<HTMLElement>>("consoleHost");

  // other component state
  protected consoleClient!: ConsoleClientService;
  protected readonly consoleHostElementId = this.uuids.get();

  constructor() {
    // we use an effect here because we want to allow the use case of reusing a single console component
    // for multiple console connections. I will 100% regret and delete this at some point.
    effect(() => {
      if (!this.config() || !this.consoleHostElement()) {
        return;
      }
      // note that even though `connect` is async, we don't invoke it asynchronously here. This is because
      // effects are _supposed_ to be synchronous, and making them async can cause Angular to ignore the
      // execution completely. If we care about this, we should set up a cancellation pattern on connect() below.
      this.connect(this.config(), this.consoleHostElement());
    });
  }

  protected async handleFullscreen(): Promise<void> {
    if (!this.consoleHostElement()) {
      throw new Error("Can't manipulate fullscreen - can't find the host.");
    }

    if (!this.fullscreen.isAvailable()) {
      await this.fullscreen.exitFullscreen();
    }
    else {
      await this.fullscreen.tryFullscreen(this.componentContainer().nativeElement);
    }
  }

  private async connect(config: ConsoleComponentConfig, hostElement: ElementRef<HTMLElement>) {
    if (this.consoleClient) {
      await this.consoleClient.disconnect();
    }

    if (!config.url) {
      throw new Error("No url provided for console connection.");
    }

    // resolve the console type from component settings + defaults
    const clientType = this.consoleForgeConfig.defaultConsoleClientType || config.consoleClientType;
    if (!clientType) {
      throw new Error("Couldn't resolve the console client type. Did you specify a default using provideConsoleForgeConfig or pass a console type to this component?");
    }

    // connect
    this.consoleClient = this.consoleClientFactory.get(clientType);
    await this.consoleClient.connect(config.url, {
      hostElementId: hostElement.nativeElement.id,
      isViewOnly: config.isViewOnly
    });
  }
}
