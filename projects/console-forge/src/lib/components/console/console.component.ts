//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, input, OnDestroy, output, signal, Type, untracked, viewChild } from '@angular/core';
import { ConsoleComponentConfig } from '../../models/console-component-config';
import { ConsoleClientService } from '../../services/console-clients/console-client.service';
import { ConsoleClientFactoryService } from '../../services/console-clients/console-client-factory.service';
import { ConsoleForgeConfig } from '../../config/console-forge-config';
import { getTextFromClipboardItem } from "../../services/clipboard/clipboard.helpers";
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
import { ClipboardService } from '../../services/clipboard/clipboard.service';
import { ConsoleComponentNetworkConfig } from '../../models/console-component-network-config';
import { CanvasService } from '../../services/canvas.service';
import { ConsoleConnectionStatus } from '../../models/console-connection-status';

@Component({
  selector: 'cf-console',
  standalone: true,
  imports: [
    ConsoleStatusComponent,
    ConsoleToolbarComponent
  ],
  providers: [
    // the console component has access to the canvas which is injected by 
    CanvasService
  ],
  styleUrl: './console.component.scss',
  templateUrl: './console.component.html',
})
export class ConsoleComponent implements OnDestroy {
  // component I/O
  autoConnect = input(true);
  config = input.required<ConsoleComponentConfig>();
  isViewOnly = input(false);
  networkConfig = input<ConsoleComponentNetworkConfig>();
  toolbarComponent = input<Type<ConsoleToolbarComponentBase>>();
  toolbarDisabled = input<boolean>(false);

  connectionStatusChanged = output<ConsoleConnectionStatus | undefined>();
  consoleClipboardUpdated = output<string>();
  consoleRecorded = output<Blob>();
  ctrlAltDelSent = output<void>();
  localClipboardUpdated = output<ClipboardItem>();
  networkConnectionRequested = output<string>();
  networkDisconnectRequested = output<void>();
  powerRequestSent = output<ConsolePowerRequest>();
  reconnectRequest = output<ConsoleComponentConfig>();
  screenshotCopied = output<Blob>();

  // services
  private readonly browserNotifications = inject(BrowserNotificationsService);
  private readonly canvasService = inject(CanvasService);
  private readonly clipboardService = inject(ClipboardService);
  private readonly consoleClientFactory = inject(ConsoleClientFactoryService);
  private readonly consoleForgeConfig = inject(ConsoleForgeConfig);
  private readonly document = inject(DOCUMENT);
  private readonly fullscreen = inject(FullScreenService);
  private readonly logger = inject(LoggerService);
  private readonly userSettingsService = inject(UserSettingsService);
  private readonly uuids = inject(UuidService);

  // viewkids
  protected readonly componentContainer = viewChild.required<ElementRef<HTMLElement>>("componentContainer");
  protected readonly consoleHostElement = viewChild.required<ElementRef<HTMLElement>>("consoleHost");

  // other component state
  protected readonly consoleClient = signal<ConsoleClientService | undefined>(undefined);
  protected readonly consoleHostElementId = `cf-console-${this.uuids.get()}`;
  protected readonly isRecording = inject(CanvasRecorderService).isRecording;
  protected readonly toolbarEnabled = computed(() => {
    // toolbar is enabled if it hasn't been disabled locally or globally:
    return !(this.toolbarDisabled() || this.consoleForgeConfig.toolbar.disabled) &&
      // AND if a toolbar component has been specified either here or globally
      (this.toolbarComponent() || this.consoleForgeConfig.toolbar.component);
  });
  protected readonly userSettings = this.userSettingsService.settings;

  constructor() {
    // we need this component to emit from outputs or call the client when signals change, so an effect
    // is the recommended solution: https://github.com/angular/angular/issues/57208

    // when config is provided and autoconnect is on, attempt to automatically connect
    effect(() => {
      if (this.autoConnect() && this.config() && !this.consoleClient()) {
        this.logger.log(LogLevel.DEBUG, "Autoconnect firing", this.config());
        this.connect(this.config());
      }
    });

    // clipboard events
    effect(() => {
      if (this.consoleClient()) {
        this.consoleClipboardUpdated.emit(this.consoleClient()!.consoleClipboardUpdated());
      }
    });
    effect(() => {
      const clipboardItem = this.clipboardService.localClipboardContentWritten();

      if (clipboardItem) {
        this.localClipboardUpdated.emit(clipboardItem);
        getTextFromClipboardItem(clipboardItem).then(value => {
          if (value) {
            this.browserNotifications.send({ title: "Copied to local clipboard", body: value });
          }
        })
      }
    });
    effect(() => {
      // all supported console clients inject a canvas into the doc. We provide it to the canvas service so it
      // can be consumed by other components (e.g. the ConsoleToolbarComponent and its implementations)
      if (this.document && this.consoleClient() && this.consoleClient()!.connectionStatus() === "connected") {
        const canvas = this.resolveConsoleCanvas();
        if (canvas) {
          this.canvasService.setCanvas(canvas);
        } else {
          this.canvasService.clearCanvas();
        }
      }
    });

    // input changes
    effect(() => {
      if (this.consoleClient() && this.consoleClient()!.connectionStatus() === "connected") {
        this.consoleClient()!.setIsViewOnly(this.isViewOnly());

        // if view only mode is on, we need to flip the canvas's tab index
        if (!this.consoleClient()?.supportedFeatures().viewOnlyMode) {
          const canvas = this.canvasService.canvas();
          if (canvas) {
            canvas.tabIndex = this.isViewOnly() ? -1 : 0;
          }
        }
      }
    });

    // output emitters
    effect(() => {
      this.connectionStatusChanged.emit(this.consoleClient()?.connectionStatus());
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

  protected async handleScreenshotCopied(screenshotData: Blob): Promise<Blob> {
    this.screenshotCopied.emit(screenshotData);
    await this.browserNotifications.send({ title: "Screenshot copied", body: "A screenshot of this console has been copied to your clipboard." })
    return screenshotData;
  }

  // automatically invoked if autoConnect is on, but can also be manually invoked outside the component
  // if retrieved as a ViewChild or whatever
  // NOTE: we should really clean up this function and ensure that all signals it needs are passed to it as parameters. it's a little opaque,
  // but invoking this inside an effect above will cause it to happen whenever _any_ of its read effects change, and it reads a lot of them.
  public async connect(config: ConsoleComponentConfig) {
    this.logger.log(LogLevel.DEBUG, "Connecting with config", config);

    const currentConnectionStatus = untracked(() => this.consoleClient()?.connectionStatus());
    if (currentConnectionStatus !== undefined && currentConnectionStatus !== "disconnected") {
      await this.consoleClient()?.disconnect();
    }

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
    this.consoleClient.update(() => client);

    // connect
    this.consoleClient()!.connect(config.url, {
      autoFocusOnConnect: config.autoFocusOnConnect,
      credentials: config.credentials,
      hostElement: this.consoleHostElement().nativeElement,
    });
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
