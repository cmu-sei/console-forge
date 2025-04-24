import { computed, Injectable, signal } from '@angular/core';
import { ConsoleClientService } from '../console-client.service';
import { ConsoleConnectionOptions } from '@/models/console-connection-options';
import { ConsoleConnectionStatus } from '@/models/console-connection-status';
import { ConsoleSupportedFeatures } from '@/models/console-supported-features';

@Injectable({ providedIn: 'root' })
export class VmWareConsoleClientService implements ConsoleClientService {
  // private wmksClient?: WMKS.WmksClient;

  public readonly connectionStatus = computed(() => this._connectionStatus());
  private readonly _connectionStatus = signal<ConsoleConnectionStatus>("disconnected")

  public readonly consoleClipboardUpdated = computed(() => this._consoleClipboardUpdated());
  private readonly _consoleClipboardUpdated = signal<string>("");

  public readonly localClipboardUpdated = computed(() => this._localClipboardUpdated());
  private readonly _localClipboardUpdated = signal<string>("");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  connect(url: string, options: ConsoleConnectionOptions): Promise<ConsoleSupportedFeatures> {
    if (!WMKS) {
      throw new Error("WMKS isn't loaded. Be sure your app is including the wmks.min.js script from the console-forge package.");
    }
    console.log("wmks version", WMKS.getVersion());

    if (!options.hostElement) {
      throw new Error("A host element is required to connect to a VMWare WMKS console.");
    }

    // this.wmksClient = WMKS.createWMKS(url, {

    // });

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
