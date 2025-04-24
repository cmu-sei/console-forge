import { computed, Injectable, signal } from '@angular/core';
import { ConsoleClientService } from '../console-client.service';
import { ConsoleConnectionOptions } from '@/models/console-connection-options';
import { ConsoleConnectionStatus } from '@/models/console-connection-status';
import { ConsoleSupportedFeatures } from '@/models/console-supported-features';
// import * as wmks from "vmware-wmks";

@Injectable({ providedIn: 'root' })
export class VmWareConsoleClientService implements ConsoleClientService {
  public readonly connectionStatus = computed(() => this._connectionStatus());
  private readonly _connectionStatus = signal<ConsoleConnectionStatus>("disconnected")

  public readonly consoleClipboardUpdated = computed(() => this._consoleClipboardUpdated());
  private readonly _consoleClipboardUpdated = signal<string>("");

  public readonly localClipboardUpdated = computed(() => this._localClipboardUpdated());
  private readonly _localClipboardUpdated = signal<string>("");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  connect(url: string, options: ConsoleConnectionOptions): Promise<ConsoleSupportedFeatures> {
    // console.log("vmware is", wmks);

    return Promise.resolve({
      onScreenKeyboard: true,
      reboot: true,
      rebootHard: true,
      shutdown: true
    });
  }

  disconnect(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  getScreenshot(): Promise<Blob> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sendClipboardText(text: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  sendCtrlAltDelete(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setIsViewOnly(isViewOnly: boolean): Promise<void> {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setScaleToContainerSize(scaleToContainerSize: boolean): Promise<void> {
    throw new Error('Method not implemented.');
  }

  dispose(): void {
    throw new Error('Method not implemented.');
  }
}
