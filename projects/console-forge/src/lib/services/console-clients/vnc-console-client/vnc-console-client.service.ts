import { computed, inject, Injectable, signal } from '@angular/core';
import NoVncClient from '@novnc/novnc/core/rfb';
import { ConsoleConnectionOptions } from '../../../models/console-connection-options';
import { ConsoleConnectionStatus } from '../../../models/console-connection-status';
import { ConsoleSupportedFeatures } from '../../../models/console-supported-features';
import { LogLevel } from '../../../models/log-level';
import { ConsoleClientService } from '../../../services/console-clients/console-client.service';
import { LoggerService } from '../../../services/logger.service';

@Injectable({ providedIn: 'root' })
export class VncConsoleClientService implements ConsoleClientService {
  public readonly consoleClipboardUpdated = computed(() => this._consoleClipboardUpdated());
  private readonly _consoleClipboardUpdated = signal<string>("");

  public readonly localClipboardUpdated = computed(() => this._localClipboardUpdated());
  private readonly _localClipboardUpdated = signal<string>("");

  public readonly connectionStatus = computed(() => this._connectionStatus());
  private readonly _connectionStatus = signal<ConsoleConnectionStatus>("disconnected");

  // injected services
  private readonly logger = inject(LoggerService);

  // the actual client from @novnc/novnc
  private noVncClient?: NoVncClient;
  // track whether a manual disconnection has been requested.
  // we check this on disconnect to see if the disconnect was unexpected.
  private manualDisconnectRequested = false;

  public async connect(url: string, options: ConsoleConnectionOptions): Promise<ConsoleSupportedFeatures> {
    try {
      if (this.noVncClient) {
        this.noVncClient.disconnect();
      }

      this._connectionStatus.update(() => "connecting");
      this.logger.log(LogLevel.DEBUG, "Connecting to", url);

      const client = new NoVncClient(options.hostElement, url, {
        credentials: {
          username: options?.credentials?.username || "",
          password: options?.credentials?.password || "",
          target: options?.credentials?.sessionId || ""
        }
      });

      // do other post-connection config
      this.noVncClient = this.doPostConnectionConfig(client, options);

      // the vnc client knows its capabilities post-connection
      // so send this back along with the things we know we can't support
      return Promise.resolve({
        onScreenKeyboard: false,
        reboot: this.noVncClient.capabilities.power,
        rebootHard: this.noVncClient.capabilities.power,
        shutdown: this.noVncClient.capabilities.power
      });
    }
    catch (err) {
      this._connectionStatus.update(() => "disconnected");
      throw err;
    }
  }

  public async disconnect(): Promise<void> {
    this.logger.log(LogLevel.DEBUG, "Manual disconnection requested");
    this.manualDisconnectRequested = true;
    return this.dispose();
  }

  public dispose(): void {
    if (this.noVncClient) {
      if (this.manualDisconnectRequested) {
        this.logger.log(LogLevel.WARNING, "Unexpected disconnection");
        this.manualDisconnectRequested = false;
      }

      this._connectionStatus.update(() => "disconnected");
      this.noVncClient.disconnect();
      this.noVncClient = undefined;
    }
  }

  public async getScreenshot(): Promise<Blob> {
    if (!this.noVncClient) {
      throw new Error("VNC client isn't connected, can't screenshot.");
    }

    return new Promise((resolve, reject) => {
      try {
        this.noVncClient!.toBlob(blob => resolve(blob));
      }
      catch (err) {
        reject(err);
      }
    });
  }

  public async sendClipboardText(text: string) {
    if (!this.noVncClient) {
      throw new Error("VNC client isn't connected; can't send clipboard text.");
    }

    this.noVncClient.clipboardPasteFrom(text);
    this._consoleClipboardUpdated.update(() => text);
  }

  public async sendCtrlAltDelete(): Promise<void> {
    if (!this.noVncClient) {
      throw new Error("VNC client isn't connected; can't send CtrlAltDelete.");
    }

    this.noVncClient.sendCtrlAltDel();
  }

  public async setIsViewOnly(isViewOnly: boolean): Promise<void> {
    if (!this.noVncClient) {
      throw new Error("VNC client isn't connected; can't set properties");
    }

    this.noVncClient.viewOnly = isViewOnly;
  }

  public async setScaleToContainerSize(scaleToContainerSize: boolean): Promise<void> {
    if (!this.noVncClient) {
      throw new Error("VNC client isn't connected; can't set properties");
    }

    console.log("setting scale to", scaleToContainerSize);
    this.noVncClient.scaleViewport = scaleToContainerSize;
  }

  private doPostConnectionConfig(client: NoVncClient, options: ConsoleConnectionOptions): NoVncClient {
    client.addEventListener("clipboard", ev => this._localClipboardUpdated.update(() => ev.detail.text));
    client.addEventListener("connect", () => this._connectionStatus.update(() => "connected"));
    client.addEventListener("disconnect", () => this.dispose());

    client.background = options.backgroundStyle || "";
    client.scaleViewport = options.scaleToContainerSize === undefined ? true : options.scaleToContainerSize;
    client.viewOnly = options.isViewOnly || false;

    // try focus if requested
    if (options.autoFocusOnConnect) {
      client.focus();
    }

    return client;
  }
}
