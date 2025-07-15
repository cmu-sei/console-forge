//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal, Type, untracked } from '@angular/core';
import { ClipboardService } from '../../services/clipboard/clipboard.service';
import { ConsoleClientService } from '../../services/console-clients/console-client.service';
import { FullScreenService } from '../../services/full-screen.service';
import { ConsoleComponentNetworkConfig } from '../../models/console-component-network-config';
import { ConsoleToolbarContext } from '../../models/console-toolbar-context';
import { ConsoleForgeConfig } from '../../config/console-forge-config';
import { ConsoleToolbarComponentBase } from '../../models/console-toolbar-component-base';
import { ConsoleNetworkConnectionRequest } from '../../models/console-network-connection-request';
import { ConsoleNetworkDisconnectionRequest } from '../../models/console-network-disconnection-request';
import { LogLevel } from '../../models/log-level';
import { WINDOW } from '../../injection/window.injection-token';
import { CanvasRecorderService } from '../../services/canvas-recorder/canvas-recorder.service';
import { LoggerService } from '../../services/logger.service';
import { CanvasRecording } from '../../services/canvas-recorder/canvas-recording';
import { ConsolePowerRequest } from '../../models/console-power-request';
import { UserSettingsService } from '../../services/user-settings.service';
import { CanvasService } from '../../services/canvas.service';
import { BlobDownloaderService } from '../../services/blob-downloader.service';

@Component({
  selector: 'cf-console-toolbar',
  imports: [CommonModule],
  templateUrl: './console-toolbar.component.html',
  styleUrl: './console-toolbar.component.scss'
})
export class ConsoleToolbarComponent {
  consoleClient = input.required<ConsoleClientService>();
  consoleNetworkConfig = input<ConsoleComponentNetworkConfig>();
  customToolbarComponent = input<Type<ConsoleToolbarComponentBase>>();
  isViewOnly = input.required<boolean>();

  canvasRecordingStarted = output<void>();
  canvasRecordingFinished = output<Blob>();
  ctrlAltDelSent = output<void>();
  keyboardInputSent = output<string>();
  networkConnectionRequested = output<ConsoleNetworkConnectionRequest>();
  networkDisconnectRequested = output<ConsoleNetworkDisconnectionRequest | undefined>();
  powerRequestSent = output<ConsolePowerRequest>();
  reconnectRequestSent = output<void>();
  screenshotCopied = output<Blob>();
  toggleFullscreen = output<void>();

  private readonly blobDownloader = inject(BlobDownloaderService);
  private readonly canvas = inject(CanvasService);
  private readonly canvasRecorder = inject(CanvasRecorderService);
  private readonly clipboardService = inject(ClipboardService);
  private readonly config = inject(ConsoleForgeConfig);
  private readonly fullscreen = inject(FullScreenService);
  private readonly logger = inject(LoggerService);
  private readonly userSettings = inject(UserSettingsService);
  private readonly window = inject(WINDOW);

  // component state
  private readonly activeConsoleRecording = signal<{ recording: CanvasRecording, timeoutRef?: number } | undefined>(undefined);
  private readonly isConnected = computed(() => this.consoleClient()?.connectionStatus() === "connected");
  private readonly isManualConsoleReconnectAvailable = computed(() => !this.config.disabledFeatures.manualConsoleReconnect && this.consoleClient()?.connectionStatus() !== "connecting");
  protected readonly toolbarComponentContext: ConsoleToolbarContext;
  protected readonly toolbarComponent = computed(() => this.customToolbarComponent() || this.config.toolbar.component);

  constructor() {
    this.toolbarComponentContext = {
      clipboard: {
        consoleClipboardText: computed(() => this.consoleClient()?.consoleClipboardUpdated()),
        sendTextToConsoleClipboard: this.handleSendTextToClipboard.bind(this)
      },
      console: {
        copyScreenshot: this.handleCopyScreenshot.bind(this),
        recordScreenStart: this.handleRecordScreenStart.bind(this),
        recordScreenStop: this.handleRecordScreenStop.bind(this),
        sendCtrlAltDel: this.handleSendCtrlAltDelete.bind(this),
        sendKeyboardInput: this.handleKeyboardInputSend.bind(this),
        sendPowerRequest: this.handleSendPowerRequest.bind(this),
        sendReconnectRequest: this.handleReconnectRequestSent.bind(this),
        supportedFeatures: computed(() => this.consoleClient()?.supportedFeatures() || {}),
        toggleFullscreen: this.handleFullscreen.bind(this)
      },
      networks: {
        config: this.consoleNetworkConfig,
        connectionRequested: this.handleNetworkConnectionRequest.bind(this),
        disconnectRequested: this.handleNetworkDisconnectionRequest.bind(this),
      },
      state: {
        activeConsoleRecording: computed(() => this.activeConsoleRecording()?.recording),
        isConnected: this.isConnected,
        isFullscreenAvailable: inject(FullScreenService).isAvailable,
        isManualReconnectAvailable: this.isManualConsoleReconnectAvailable,
        isRecordingAvailable: computed(() => !!this.canvas.canvas()),
        isViewOnly: this.isViewOnly
      },
      userSettings: this.userSettings
    };

    // VNC seems to get mouse tracking weirdness in some configurations when exiting fullscreen mode, so work around for now
    // by requesting a reconnect when exiting FS
    effect(() => {
      const untrackedContext = untracked(() => ({
        isConnected: this.isConnected(),
        requireReconnectOnFullscreenExit: this.toolbarComponentContext.console.supportedFeatures().requireReconnectOnExitingFullscreen || false,
      }));

      const isFullscreenActive = this.fullscreen.isActive();
      if (untrackedContext.isConnected && untrackedContext.requireReconnectOnFullscreenExit && !isFullscreenActive) {
        this.toolbarComponentContext.console.sendReconnectRequest();
      }
    });
  }

  protected async handleCopyScreenshot() {
    if (!this.canvas.canvas()) {
      throw new Error("Couldn't resolve the canvas; can't copy screenshot.");
    }

    this.canvas.canvas()!.toBlob(blob => {
      if (!blob) {
        throw new Error("Couldn't resolve canvas blob.");
      }

      this.clipboardService.copyBlob(blob);
      this.screenshotCopied.emit(blob);
    })
  }

  protected handleFullscreen(): Promise<void> {
    this.toggleFullscreen.emit();
    return Promise.resolve();
  }

  protected async handleKeyboardInputSend(text: string): Promise<void> {
    await this.consoleClient().sendKeyboardInput(text);
    this.keyboardInputSent.emit(text);
  }

  protected handleNetworkConnectionRequest(request: ConsoleNetworkConnectionRequest) {
    const availableNetworks = this.consoleNetworkConfig()?.networks || [];
    if (availableNetworks.indexOf(request.network) === -1) {
      throw new Error(`Network "${request.network}" is not available to this console.`);
    }

    this.networkConnectionRequested.emit(request);
  }

  protected handleNetworkDisconnectionRequest(request?: ConsoleNetworkDisconnectionRequest) {
    if (request?.nic && this.consoleNetworkConfig()?.nics) {
      if (this.consoleNetworkConfig()?.nics.indexOf(request.nic) === -1) {
        throw new Error(`NIC ${request.nic} is not available to this console.`);
      }
    }

    this.networkDisconnectRequested.emit(request);
  }

  protected handleReconnectRequestSent(): Promise<void> {
    this.logger.log(LogLevel.DEBUG, "Manual reconnect request from toolbar");

    if (!this.isManualConsoleReconnectAvailable()) {
      return Promise.reject("Manual console reconnection is unavailable.");
    }

    this.reconnectRequestSent.emit();
    return Promise.resolve();
  }

  protected handleRecordScreenStart(): void {
    if (!this.canvas.canvas()) {
      throw new Error("Can't resolve canvas for recording");
    }

    this.logger.log(LogLevel.DEBUG, "Recording canvas", this.canvas.canvas());
    const recordingInstance = this.canvasRecorder.startRecord(this.canvas.canvas()!);

    // set a timeout listener if a max duration is configured in the lib
    let timeoutRef: number | undefined = undefined;
    if (this.config.canvasRecording?.maxDuration) {
      timeoutRef = this.window.setTimeout(() => this.handleRecordScreenStop(), this.config.canvasRecording.maxDuration);
    }

    this.activeConsoleRecording.update(() => ({
      recording: recordingInstance,
      timeoutRef: timeoutRef
    }));
    this.canvasRecordingStarted.emit();
  }

  protected async handleRecordScreenStop(): Promise<Blob> {
    if (!this.activeConsoleRecording()) {
      throw new Error("There is no active console recording - unable to stop and emit recorded data.");
    }

    this.logger.log(LogLevel.DEBUG, "Recording stopped.");
    const recording = await this.activeConsoleRecording()!.recording.stop();
    this.activeConsoleRecording.update(() => undefined);

    // if configured, automatically offer a download
    if (recording && this.config.canvasRecording.autoDownloadCompletedRecordings) {
      this.blobDownloader.download(recording, "your-console-recording.webm");
    }

    this.canvasRecordingFinished.emit(recording);
    this.logger.log(LogLevel.DEBUG, "Recording emitted.");
    return recording;
  }

  protected handleSendCtrlAltDelete() {
    this.consoleClient().sendCtrlAltDelete();
    this.ctrlAltDelSent.emit();
    return Promise.resolve();
  }

  private async handleSendPowerRequest(request: ConsolePowerRequest): Promise<void> {
    this.consoleClient().sendPowerRequest(request);
    this.powerRequestSent.emit(request);
    return Promise.resolve();
  }

  protected async handleSendTextToClipboard(text: string) {
    if (text) {
      this.consoleClient().sendClipboardText(text);
    }
  }
}
