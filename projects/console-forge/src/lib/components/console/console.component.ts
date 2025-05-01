import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, input, model, output, signal, Type, viewChild } from '@angular/core';
import { ConsoleComponentConfig } from './console-component-config';
import { ConsoleClientService } from '../../services/console-clients/console-client.service';
import { ConsoleClientFactoryService } from '../../services/console-clients/console-client-factory.service';
import { ConsoleForgeConfig } from '../../config/console-forge-config';
import { UuidService } from '../../services/uuid.service';
import { LoggerService } from '../../services/logger.service';
import { FullScreenService } from '../../services/full-screen.service';
import { ConsoleToolbarPosition } from '../../models/console-toolbar-position';
import { LogLevel } from '../../models/log-level';
import { ConsoleToolbarComponent } from '../console-toolbar/console-toolbar.component';
import { ConsoleToolbarComponentBase } from '../../models/console-toolbar-component-base';

@Component({
  selector: 'cf-console',
  standalone: true,
  imports: [ConsoleToolbarComponent],
  styleUrl: './console.component.scss',
  templateUrl: './console.component.html',
})
export class ConsoleComponent {
  // component I/O
  autoConnect = input(true);
  availableNetworks = input<string[]>();
  config = input.required<ConsoleComponentConfig>();
  currentNetwork = input<string>();
  isViewOnly = input(false);
  scaleToContainerSize = input(true);
  toolbarComponent = input<Type<ConsoleToolbarComponentBase>>();
  toolbarPosition = model<ConsoleToolbarPosition>("left");

  consoleClipboardUpdated = output<string>();
  consoleRecorded = output<Blob>();
  ctrlAltDelSent = output<void>();
  localClipboardUpdated = output<string>();
  networkConnectionRequested = output<string>();
  networkDisconnectRequested = output<void>();
  screenshotCopied = output<Blob>();
  status = computed(() => this.consoleClient()?.connectionStatus() || "disconnected");

  // services
  private readonly consoleClientFactory = inject(ConsoleClientFactoryService);
  private readonly consoleForgeConfig = inject(ConsoleForgeConfig);
  private readonly document = inject(DOCUMENT);
  private readonly fullscreen = inject(FullScreenService);
  private readonly logger = inject(LoggerService);
  private readonly uuids = inject(UuidService);

  // viewkids
  protected consoleCanvasElement?: HTMLCanvasElement;
  protected readonly componentContainer = viewChild.required<ElementRef<HTMLElement>>("componentContainer");
  protected readonly consoleHostElement = viewChild.required<ElementRef<HTMLElement>>("consoleHost");

  // other component state
  protected readonly consoleClient = signal<ConsoleClientService | undefined>(undefined);
  protected readonly consoleHostElementId = `cf-console-${this.uuids.get()}`;

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
      this.connect(this.config());
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
    effect(() => {
      // some (all?) console clients inject a canvas into the doc. If we can find it, we can offer a "record" button
      if (this.document && this.consoleClient() && this.consoleClient()!.connectionStatus() == "connected") {
        this.consoleCanvasElement = this.resolveConsoleCanvas() || undefined;
      }
    })

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

  protected handleToolbarPositionChangeRequest(position: ConsoleToolbarPosition) {
    this.toolbarPosition.update(() => position);
  }

  // automatically invoked if autoConnect is on, but can also be manually invoked outside the component
  // if retrieved as a ViewChild or whatever
  public async connect(config: ConsoleComponentConfig) {
    await this.consoleClient()?.disconnect();

    if (!config.url) {
      throw new Error("No url provided for console connection.");
    }

    if (!this.consoleHostElement().nativeElement) {
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
      hostElement: this.consoleHostElement().nativeElement,
      isViewOnly: this.isViewOnly(),
    });
  }

  public async disconnect() {
    this.logger.log(LogLevel.DEBUG, "Console component disconnect invoked.");
    await this.consoleClient()?.disconnect();
  }

  private resolveConsoleCanvas() {
    if (!this.document) {
      return null;
    }

    return (this.document.querySelector(`#${this.consoleHostElementId} canvas`) as HTMLCanvasElement) || undefined;
  }
}
