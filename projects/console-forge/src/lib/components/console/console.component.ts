import { Component, computed, effect, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { ConsoleComponentConfig } from './console-component-config';
import { ConsoleClientService } from '@/services/console-clients/console-client.service';
import { ConsoleClientFactoryService } from '@/services/console-clients/console-client-factory.service';
import { ConsoleForgeConfig } from '@/config/console-forge-config';
import { UuidService } from '@/services/uuid.service';
import { LoggerService } from '@/services/logger.service';
import { ConsoleToolbarComponent } from '../console-toolbar/console-toolbar.component';
import { FullScreenService } from '@/services/full-screen.service';
import { LogLevel } from '@/models/log-level';
import { ConsoleToolbarPosition } from '@/models/console-toolbar-position';

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
  autoConnect = input(true);
  config = input.required<ConsoleComponentConfig>();
  isViewOnly = input(false);
  scaleToContainerSize = input(true);
  toolbarPosition = input<ConsoleToolbarPosition>("left");

  consoleClipboardUpdated = output<string>();
  ctrlAltDelSent = output<void>();
  localClipboardUpdated = output<string>();
  screenshotCopied = output<Blob>();
  status = computed(() => this.consoleClient()?.connectionStatus() || "disconnected");

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
  protected availableNetworks = computed(() => {

  });
  protected consoleClient = signal<ConsoleClientService | undefined>(undefined);
  protected readonly consoleHostElementId = this.uuids.get();

  constructor() {
    // we use an effect here because we want to allow the use case of reusing a single console component
    // for multiple console connections. I will 100% regret and delete this at some point.
    effect(() => {
      if (!this.autoConnect || !this.config() || !this.consoleHostElement()) {
        this.logger.log(LogLevel.INFO, "Autoconnecting with", this.config(), this.consoleHostElement());
        return;
      }
      // note that even though `connect` is async, we don't invoke it asynchronously here. This is because
      // effects are _supposed_ to be synchronous, and making them async can cause Angular to ignore the
      // execution completely. If we care about this, we should set up a cancellation pattern on connect() below.
      this.connect(this.config(), this.consoleHostElement());
    });

    // we need this component to emit from outputs or call the client when signals change, so an effect
    // is the recommended solution: https://github.com/angular/angular/issues/57208
    // clipboard events
    effect(() => {
      if (this.consoleClient()) {
        this.consoleClipboardUpdated.emit(this.consoleClient()!.consoleClipboardUpdated());
      }
    });
    effect(() => {
      if (this.consoleClient()) {
        this.localClipboardUpdated.emit(this.consoleClient()!.localClipboardUpdated());
      }
    });
    // input changes
    effect(() => this.consoleClient()?.setIsViewOnly(this.isViewOnly()));
    effect(() => this.consoleClient()?.setScaleToContainerSize(this.scaleToContainerSize()));
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

  // automatically invoked if autoConnect is on, but can also be manually invoked outside the component
  // if retrieved as a ViewChild or whatever
  public async connect(config: ConsoleComponentConfig, hostElement: ElementRef<HTMLElement>) {
    await this.consoleClient()?.disconnect();

    if (!config.url) {
      throw new Error("No url provided for console connection.");
    }

    if (!hostElement?.nativeElement) {
      throw new Error("Couldn't resolve the console host before connection.");
    }

    // resolve the console type from component settings + defaults
    const clientType = this.consoleForgeConfig.defaultConsoleClientType || config.consoleClientType;
    if (!clientType) {
      throw new Error("Couldn't resolve the console client type. Did you specify a default using provideConsoleForgeConfig or pass a console type to this component?");
    }

    // connect
    this.consoleClient.update(() => this.consoleClientFactory.get(clientType));
    await this.consoleClient()!.connect(config.url, {
      autoFocusOnConnect: config.autoFocusOnConnect,
      credentials: config.credentials,
      hostElement: hostElement.nativeElement,
      isViewOnly: this.isViewOnly(),
    });
  }

  public async disconnect() {
    this.logger.log(LogLevel.DEBUG, "Console component disconnect invoked.");
    await this.consoleClient()?.disconnect();
  }
}
