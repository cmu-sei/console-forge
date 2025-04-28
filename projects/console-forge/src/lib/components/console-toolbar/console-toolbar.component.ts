import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, TemplateRef } from '@angular/core';
import { ClipboardService } from '../../services/clipboard.service';
import { ConsoleClientService } from '../../services/console-clients/console-client.service';
import { FullScreenService } from '../../services/full-screen.service';
import { ConsoleToolbarTemplateContext } from '../../models/console-toolbar-template-context';
import { ConsoleToolbarDefaultComponent } from "../console-toolbar-default/console-toolbar-default.component";

@Component({
  selector: 'cf-console-toolbar',
  imports: [
    CommonModule,
    ConsoleToolbarDefaultComponent
  ],
  templateUrl: './console-toolbar.component.html',
  styleUrl: './console-toolbar.component.scss'
})
export class ConsoleToolbarComponent {
  availableNetworks = input<string[]>();
  consoleClient = input.required<ConsoleClientService>();
  currentNetwork = input<string>();
  customTemplate = input<TemplateRef<ConsoleToolbarTemplateContext>>();

  ctrlAltDelSent = output<void>();
  networkConnectionRequested = output<string>();
  networkDisconnectRequested = output<void>();
  screenshotCopied = output<Blob>();
  toggleFullscreen = output<void>();

  private readonly clipboardService = inject(ClipboardService);

  // component state
  protected readonly fullscreenAvailable = inject(FullScreenService).isAvailable;
  protected readonly templateContext: ConsoleToolbarTemplateContext = {
    console: {
      copyScreenshot: this.handleCopyScreenshot.bind(this),
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
    }
  };

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
