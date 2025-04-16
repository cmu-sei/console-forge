import { AfterViewInit, Component, computed, effect, ElementRef, inject, input, Signal, ViewChild } from '@angular/core';
import { ConsoleComponentConfig } from './console-component-config';
import { ConsoleClientService } from '@/services/console-clients/console-client.service';
import { ConsoleClientFactoryService } from '@/services/console-clients/console-client-factory.service';
import { ConsoleForgeConfig } from '@/config/console-forge-config';
import { UuidService } from '@/services/uuid.service';
import { LoggerService } from '@/services/logger.service';
import { LogLevel } from '@/models/log-level';

@Component({
  selector: 'cf-console',
  imports: [],
  templateUrl: './console.component.html',
  styleUrl: './console.component.scss'
})
export class ConsoleComponent implements AfterViewInit {
  // component I/O
  config = input.required<ConsoleComponentConfig>();
  status = computed(() => this.consoleClient?.connectionStatus());

  // services
  private consoleClient!: ConsoleClientService;
  private consoleClientFactory = inject(ConsoleClientFactoryService);
  private consoleForgeConfig = inject(ConsoleForgeConfig);
  private logger = inject(LoggerService);
  private uuids = inject(UuidService);

  // viewkids
  @ViewChild("consoleHost") consoleHostElement?: ElementRef;

  // other component state
  protected readonly consoleHostElementId = this.uuids.get();

  constructor() {
    // we use an effect here because we want to allow the use case of reusing a single console component
    // for multiple console connections. I will 100% regret and delete this at some point.
    effect(() => {
      if (!this.config()) {
        return;
      }
      // note that even though `connect` is async, we don't invoke it asynchronously here. This is because
      // effects are _supposed_ to be synchronous, and making them async can cause Angular to ignore the
      // execution completely. If we care about this, we should set up a cancellation pattern on connect() below.
      this.connect(this.config());
    });
  }

  public ngAfterViewInit(): void {
  }

  private async connect(config: ConsoleComponentConfig) {
    if (!this.consoleHostElement?.nativeElement?.id) {
      this.logger.log(LogLevel.WARNING, "Couldn't connect the console. This might be normal; no idea.");
      return;
    }

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
      hostElementId: this.consoleHostElement.nativeElement.id,
      isViewOnly: config.isViewOnly
    });
  }
}
