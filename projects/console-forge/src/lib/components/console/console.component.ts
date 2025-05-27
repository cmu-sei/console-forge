import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, input, OnDestroy, output, signal, Type, viewChild } from '@angular/core';
import { ConsoleComponentConfig } from './console-component-config';
import { ConsoleClientService } from '../../services/console-clients/console-client.service';
import { ConsoleClientFactoryService } from '../../services/console-clients/console-client-factory.service';
import { ConsoleForgeConfig } from '../../config/console-forge-config';
import { UuidService } from '../../services/uuid.service';
import { LoggerService } from '../../services/logger.service';
import { FullScreenService } from '../../services/full-screen.service';
import { LogLevel } from '../../models/log-level';
import { ConsoleToolbarComponent } from '../console-toolbar/console-toolbar.component';
import { ConsoleToolbarComponentBase } from '../../models/console-toolbar-component-base';
import { BrowserNotificationsService } from '../../services/browser-notifications/browser-notifications.service';
import { ConsoleStatusComponent } from '../console-status/console-status.component';
import { UserSettingsService } from '../../services/user-settings.service';
import { ConsolePowerRequest } from '../../models/console-power-request';
import { CanvasRecorderService } from '../../services/canvas-recorder/canvas-recorder.service';

@Component({
  selector: 'cf-console',
  standalone: true,
  imports: [
    ConsoleStatusComponent,
    ConsoleToolbarComponent
  ],
  styleUrl: './console.component.scss',
  templateUrl: './console.component.html',
})
export class ConsoleComponent implements OnDestroy {
  // component I/O
  availableNetworks = input<string[]>();
  config = input.required<ConsoleComponentConfig>();
  currentNetwork = input<string>();
  isViewOnly = input(false);
  toolbarComponent = input<Type<ConsoleToolbarComponentBase>>();

  consoleClipboardUpdated = output<string>();
  consoleRecorded = output<Blob>();
  ctrlAltDelSent = output<void>();
  localClipboardUpdated = output<string>();
  networkConnectionRequested = output<string>();
  networkDisconnectRequested = output<void>();
  powerRequestSent = output<ConsolePowerRequest>();
  screenshotCopied = output<Blob>();
  status = computed(() => this.consoleClient()?.connectionStatus() || "disconnected");

  // services
  private readonly browserNotifications = inject(BrowserNotificationsService);
  private readonly consoleClientFactory = inject(ConsoleClientFactoryService);
  private readonly consoleForgeConfig = inject(ConsoleForgeConfig);
  private readonly document = inject(DOCUMENT);
  private readonly fullscreen = inject(FullScreenService);
  private readonly logger = inject(LoggerService);
  private readonly userSettingsService = inject(UserSettingsService);
  private readonly uuids = inject(UuidService);

  // viewkids
  protected consoleCanvasElement?: HTMLCanvasElement;
  protected readonly componentContainer = viewChild.required<ElementRef<HTMLElement>>("componentContainer");
  protected readonly consoleHostElement = viewChild.required<ElementRef<HTMLElement>>("consoleHost");

  // other component state
  protected readonly consoleClient = signal<ConsoleClientService | undefined>(undefined);
  protected readonly consoleHostElementId = `cf-console-${this.uuids.get()}`;
  protected readonly isRecording = inject(CanvasRecorderService).isRecording;
  protected readonly userSettings = this.userSettingsService.settings;

  constructor() {
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
      // all supported console clients inject a canvas into the doc. If we can find it, we can offer a "record" button
      if (this.document && this.consoleClient() && this.consoleClient()!.connectionStatus() === "connected") {
        this.consoleCanvasElement = this.resolveConsoleCanvas() || undefined;
      }
    })

    // input changes
    effect(() => {
      if (this.consoleClient() && this.consoleClient()!.connectionStatus() === "connected") {
        this.consoleClient()!.setIsViewOnly(this.isViewOnly())
      }
    });

    // settings changes
    effect(() => {
      const currentSettings = this.userSettingsService.settings();
      if (this.consoleClient() && this.consoleClient()?.connectionStatus() === "connected") {
        this.consoleClient()!.setPreserveAspectRatioOnScale(currentSettings.console.preserveAspectRatioOnScale);
      }
    });
  }

  public async ngOnDestroy(): Promise<void> {
    if (this.consoleClient()) {
      await this.consoleClient()!.dispose();
    }
  }

  protected handleConsoleRecordingStarted(): Promise<void> {
    return this.browserNotifications.send({ title: "Recording Console", body: "This console is being screen-recorded. Hit \"Record\" again to stop." })
  }

  protected async handleCtrlAltDelSent(): Promise<void> {
    this.ctrlAltDelSent.emit();
    await this.browserNotifications.send({ title: "Ctrl + Alt + Del sent", body: "Sent a Ctrl + Alt + Del input to the remote machine." });
  }

  protected async handleScreenshotCopied(screenshotData: Blob): Promise<Blob> {
    this.screenshotCopied.emit(screenshotData);
    await this.browserNotifications.send({ title: "Screenshot copied", body: "A screenshot of this console has been copied to your clipboard." })
    return screenshotData;
  }

  protected async handleFullscreen(): Promise<void> {
    if (!this.componentContainer()) {
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
  public async connect(config: ConsoleComponentConfig) {
    // weirdly, even reading this status here causes an infinite loop or something. i think i got too silly with effects.
    // console.log("on connection, status was", this.consoleClient()?.connectionStatus());
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
    const client = this.consoleClientFactory.get(clientType);

    // connect
    await client.connect(config.url, {
      autoFocusOnConnect: config.autoFocusOnConnect,
      credentials: config.credentials,
      hostElement: this.consoleHostElement().nativeElement,
    });

    // the order here is important - we only update all the things that care about our console client once we're connected,
    // otherwise things like trying to set the "view only" property before connection will function strangely.
    // need to look into ways to validate this via testing
    this.consoleClient.update(() => client);
  }

  public async disconnect() {
    this.logger.log(LogLevel.DEBUG, "Console component disconnect invoked.");
    await this.consoleClient()?.disconnect();
    this.consoleClient.update(() => undefined);
  }

  private resolveConsoleCanvas() {
    if (!this.document) {
      return null;
    }

    return (this.document.querySelector(`#${this.consoleHostElementId} canvas`) as HTMLCanvasElement) || undefined;
  }
}
