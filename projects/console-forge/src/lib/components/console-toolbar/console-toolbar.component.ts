import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal, Type } from '@angular/core';
import { ClipboardService } from '../../services/clipboard.service';
import { ConsoleClientService } from '../../services/console-clients/console-client.service';
import { FullScreenService } from '../../services/full-screen.service';
import { ConsoleToolbarContext } from '../../models/console-toolbar-context';
import { ConsoleForgeConfig } from '../../config/console-forge-config';
import { ConsoleToolbarComponentBase } from '../../models/console-toolbar-component-base';
import { CanvasRecorderService } from '../../services/canvas-recorder.service';
import { LoggerService } from '../../services/logger.service';
import { LogLevel } from '../../models/log-level';
import { ConsoleToolbarPosition } from '../../models/console-toolbar-position';
import { ConsoleToolbarOrientation } from '../../models/console-toolbar-orientation';

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
  toolbarOrientation = input.required<ConsoleToolbarOrientation>();

  canvasRecorded = output<Blob>();
  ctrlAltDelSent = output<void>();
  networkConnectionRequested = output<string>();
  networkDisconnectRequested = output<void>();
  screenshotCopied = output<Blob>();
  toggleFullscreen = output<void>();
  toolbarPositionChangeRequested = output<ConsoleToolbarPosition>();

  private readonly canvasRecorder = inject(CanvasRecorderService);
  private readonly clipboardService = inject(ClipboardService);
  private readonly config = inject(ConsoleForgeConfig);
  private readonly logger = inject(LoggerService);

  // component state
  protected readonly fullscreenAvailable = inject(FullScreenService).isAvailable;
  private readonly isRecording = signal(false);
  protected readonly toolbarComponentContext: ConsoleToolbarContext = {
    console: {
      copyScreenshot: this.handleCopyScreenshot.bind(this),
      recordScreen: this.handleRecordScreen.bind(this),
      sendCtrlAltDel: this.handleSendCtrlAltDelete.bind(this),
      sendTextToClipboard: this.handleSendTextToClipboard.bind(this),
      toggleFullscreen: this.handleFullscreen.bind(this)
    },
    networks: {
      connectionRequested: this.handleNetworkConnectionRequest.bind(this),
      disconnectRequested: () => this.networkDisconnectRequested.emit(),
      current: computed(() => this.currentNetwork()),
      list: computed(() => this.availableNetworks() || [])
    },
    state: {
      isConnected: computed(() => this.consoleClient().connectionStatus() === "connected"),
      isFullscreenAvailable: inject(FullScreenService).isAvailable,
      isRecording: this.isRecording,
      isRecordingAvailable: computed(() => !!this.consoleCanvas())
    },
    toolbar: {
      dockTo: position => this.toolbarPositionChangeRequested.emit(position),
      orientation: this.toolbarOrientation,
    }
  };
  protected readonly toolbarComponent = computed(() => this.customToolbarComponent() || this.config.consoleToolbarComponent);

  protected handleChangeToolbarPosition(toolbarPosition: ConsoleToolbarPosition): void {
    this.toolbarPositionChangeRequested.emit(toolbarPosition);
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

  protected async handleRecordScreen(): Promise<Blob> {
    if (!this.consoleCanvas()) {
      throw new Error("Can't resolve canvas for recording");
    }

    try {
      this.logger.log(LogLevel.DEBUG, "Recording canvas", this.consoleCanvas());
      this.isRecording.update(() => true);
      const recording = await this.canvasRecorder.startRecord(this.consoleCanvas()!, 15000);
      this.canvasRecorded.emit(recording);
      return recording;
    }
    catch (err) {
      this.logger.log(LogLevel.ERROR, "Screen recording error", err);
      throw err;
    } finally {
      this.isRecording.update(() => false);
    }
  }

  protected handleSendCtrlAltDelete() {
    this.consoleClient().sendCtrlAltDelete();
    this.ctrlAltDelSent.emit();
    return Promise.resolve();
  }

  protected async handleSendTextToClipboard(text: string) {
    if (text) {
      this.consoleClient().sendClipboardText(text);
    }
  }
}
