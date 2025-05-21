import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal, Type } from '@angular/core';
import { ClipboardService } from '../../services/clipboard.service';
import { ConsoleClientService } from '../../services/console-clients/console-client.service';
import { FullScreenService } from '../../services/full-screen.service';
import { ConsoleToolbarContext } from '../../models/console-toolbar-context';
import { ConsoleForgeConfig } from '../../config/console-forge-config';
import { ConsoleToolbarComponentBase } from '../../models/console-toolbar-component-base';
import { CanvasRecorderService } from '../../services/canvas-recorder/canvas-recorder.service';
import { LoggerService } from '../../services/logger.service';
import { LogLevel } from '../../models/log-level';
import { CanvasRecording } from '../../services/canvas-recorder/canvas-recording';
import { UserSettingsService } from '../../services/user-settings.service';
import { ConsolePowerRequest } from '../../models/console-power-request';

@Component({
  selector: 'cf-console-toolbar',
  imports: [CommonModule],
  templateUrl: './console-toolbar.component.html',
  styleUrl: './console-toolbar.component.scss'
})
export class ConsoleToolbarComponent {
  availableNetworks = input<string[]>();
  consoleClient = input.required<ConsoleClientService>();
  consoleCanvas = input<HTMLCanvasElement>();
  currentNetwork = input<string>();
  customToolbarComponent = input<Type<ConsoleToolbarComponentBase>>();

  canvasRecordingStarted = output<void>();
  canvasRecordingFinished = output<Blob>();
  ctrlAltDelSent = output<void>();
  networkConnectionRequested = output<string>();
  networkDisconnectRequested = output<void>();
  powerRequestSent = output<ConsolePowerRequest>();
  screenshotCopied = output<Blob>();
  toggleFullscreen = output<void>();

  private readonly canvasRecorder = inject(CanvasRecorderService);
  private readonly clipboardService = inject(ClipboardService);
  private readonly config = inject(ConsoleForgeConfig);
  private readonly logger = inject(LoggerService);
  private readonly userSettings = inject(UserSettingsService);

  // component state
  private readonly activeConsoleRecording = signal<CanvasRecording | undefined>(undefined);
  protected readonly toolbarComponentContext: ConsoleToolbarContext;
  protected readonly toolbarComponent = computed(() => this.customToolbarComponent() || this.config.consoleToolbarComponent);

  constructor() {
    this.toolbarComponentContext = {
      console: {
        copyScreenshot: this.handleCopyScreenshot.bind(this),
        recordScreenStart: this.handleRecordScreenStart.bind(this),
        recordScreenStop: this.handleRecordScreenStop.bind(this),
        sendCtrlAltDel: this.handleSendCtrlAltDelete.bind(this),
        sendPowerRequest: this.handleSendPowerRequest.bind(this),
        sendTextToClipboard: this.handleSendTextToClipboard.bind(this),
        supportedFeatures: computed(() => this.consoleClient().supportedFeatures()),
        toggleFullscreen: this.handleFullscreen.bind(this)
      },
      networks: {
        connectionRequested: this.handleNetworkConnectionRequest.bind(this),
        disconnectRequested: () => this.networkDisconnectRequested.emit(),
        current: computed(() => this.currentNetwork()),
        list: computed(() => this.availableNetworks() || [])
      },
      settings: {
        current: this.userSettings.settings,
        update: this.userSettings.update
      },
      state: {
        activeConsoleRecording: computed(() => this.activeConsoleRecording()),
        isConnected: computed(() => this.consoleClient() && this.consoleClient().connectionStatus() === "connected"),
        isFullscreenAvailable: inject(FullScreenService).isAvailable,
        isRecordingAvailable: computed(() => !!this.consoleCanvas())
      }
    };
  }



  protected async handleCopyScreenshot() {
    const blob = await this.consoleClient().getScreenshot();
    await this.clipboardService.copyBlob(blob);
    this.screenshotCopied.emit(blob);
  }

  protected handleFullscreen(): Promise<void> {
    this.toggleFullscreen.emit();
    return Promise.resolve();
  }

  protected handleNetworkConnectionRequest(networkName: string) {
    const availableNetworks = this.availableNetworks() || [];
    if (availableNetworks.indexOf(networkName) === -1) {
      throw new Error(`Network ${networkName} is not available to this console.`);
    }

    this.networkConnectionRequested.emit(networkName);
  }

  protected handleRecordScreenStart(): void {
    if (!this.consoleCanvas()) {
      throw new Error("Can't resolve canvas for recording");
    }

    this.logger.log(LogLevel.DEBUG, "Recording canvas", this.consoleCanvas());
    const recordingInstance = this.canvasRecorder.startRecord(this.consoleCanvas()!);
    this.activeConsoleRecording.update(() => recordingInstance);
    this.canvasRecordingStarted.emit();
  }

  protected async handleRecordScreenStop(): Promise<Blob> {
    if (!this.activeConsoleRecording()) {
      throw new Error("There is no active console recording - unable to stop and emit recorded data.");
    }

    this.logger.log(LogLevel.DEBUG, "Recording stopped.");
    const recording = await this.activeConsoleRecording()!.stop();
    this.activeConsoleRecording.update(() => undefined);
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
