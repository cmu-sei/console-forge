//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { inject, Injectable, signal } from '@angular/core';
import NoVncClient from '@novnc/novnc/core/rfb';
import { ConsoleForgeConfig } from '../../../config/console-forge-config';
import { ConsoleConnectionOptions } from '../../../models/console-connection-options';
import { ConsoleConnectionStatus } from '../../../models/console-connection-status';
import { ConsolePowerRequest } from '../../../models/console-power-request';
import { ConsoleSupportedFeatures } from '../../../models/console-supported-features';
import { LogLevel } from '../../../models/log-level';
import { ConsoleClientService } from '../../../services/console-clients/console-client.service';
import { LoggerService } from '../../../services/logger.service';
import { UserSettingsService } from '../../user-settings.service';
import { ClipboardService } from '../../clipboard/clipboard.service';

@Injectable({ providedIn: 'root' })
export class VncConsoleClientService implements ConsoleClientService {
  private readonly _consoleClipboardUpdated = signal<string>("");
  public readonly consoleClipboardUpdated = this._consoleClipboardUpdated.asReadonly();

  private readonly _connectionStatus = signal<ConsoleConnectionStatus>("disconnected");
  public readonly connectionStatus = this._connectionStatus.asReadonly();

  private readonly _supportedFeatures = signal<ConsoleSupportedFeatures>({
    clipboardAutomaticLocalCopy: true,
    clipboardRemoteWrite: true,
    onScreenKeyboard: false,
    powerManagement: false
  });
  public readonly supportedFeatures = this._supportedFeatures.asReadonly();

  // injected services
  private readonly cfConfig = inject(ConsoleForgeConfig);
  private readonly clipboardService = inject(ClipboardService);
  private readonly logger = inject(LoggerService);
  private readonly userSettings = inject(UserSettingsService);

  // the actual client from @novnc/novnc
  private noVncClient?: NoVncClient;

  public async connect(url: string, options: ConsoleConnectionOptions): Promise<ConsoleSupportedFeatures> {
    if (this.noVncClient) {
      this.noVncClient.disconnect();
    }

    return new Promise((resolve, reject) => {
      try {
        this._connectionStatus.update(() => "connecting");
        this.logger.log(LogLevel.DEBUG, "Connecting to", url);

        let client = new NoVncClient(options.hostElement, url, {
          credentials: {
            password: options?.credentials?.accessTicket || options?.credentials?.password || "",
            // explicitly not supporting these for now
            username: "",
            target: ""
          }
        });

        client = this.doPreConnectionConfig(client);
        client.addEventListener("connect", () => {
          // do other post-connection config
          this.noVncClient = this.doPostConnectionConfig(client, options);

          // the vnc client knows its capabilities post-connection
          // so send this back along with the things we know we can't support
          const supportedFeatures: ConsoleSupportedFeatures = {
            clipboardAutomaticLocalCopy: true,
            clipboardRemoteWrite: true,
            onScreenKeyboard: false,
            powerManagement: this.noVncClient.capabilities.power,
          };

          this._supportedFeatures.update(() => supportedFeatures);
          this.noVncClient = client;
          resolve(supportedFeatures);
        });
      }
      catch (err) {
        this._connectionStatus.update(() => "disconnected");
        reject(err);
      }
    });
  }

  public async disconnect(): Promise<void> {
    this.logger.log(LogLevel.DEBUG, "Manual disconnection requested");
    return this.handleDisconnect(true);
  }

  public dispose(): Promise<void> {
    return this.disconnect();
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

  public async sendKeyboardInput(text: string): Promise<void> {
    if (!this.noVncClient) {
      throw new Error("VNC client isn't connected; can't send keyboard input.");
    }

    // split by line and remove empties
    const lines = text
      .split(/\r?\n|\r|\n/g)
      .map(line => line.trim())
      .filter(line => !!line);

    this.logger.log(LogLevel.INFO, "Sending lines", lines);

    for (let i = 0; i < lines.length; i++) {
      const lineCharacters = lines[i].split("");

      for (const chr of lineCharacters) {
        this.noVncClient.sendKey(chr.charCodeAt(0), null);
      }

      if ((i + 1) < lines.length) {
        // send "return" between lines
        this.noVncClient.sendKey(0xFF0D, null);
      }
    }
  }

  public async sendPowerRequest(request: ConsolePowerRequest): Promise<void> {
    if (!this.noVncClient) {
      throw new Error(`VNC client isn't connected; can't send power request "${request}"`);
    }

    if (!this.noVncClient.capabilities.power) {
      throw new Error(`The machine you're connected to over VNC doesn't have the "power" capability, so reboots, resets, and shutdowns aren't permitted.`);
    }

    switch (request) {
      case "reboot":
        this.noVncClient.machineReboot();
        return;
      case "rebootHard":
        this.noVncClient.machineReset();
        return;
      case "shutdown":
        this.noVncClient.machineShutdown();
        return;
    }
  }

  public async setIsViewOnly(isViewOnly: boolean): Promise<void> {
    if (!this.noVncClient) {
      throw new Error("VNC client isn't connected; can't set properties");
    }

    this.noVncClient.viewOnly = isViewOnly;
  }

  public async setPreserveAspectRatioOnScale(preserve: boolean): Promise<void> {
    if (!this.noVncClient) {
      throw new Error("VNC client isn't connected; can't set properties");
    }

    this.logger.log(LogLevel.DEBUG, "Set preserve aspect ratio to", preserve);
    this.noVncClient.scaleViewport = preserve;
  }

  private doPreConnectionConfig(client: NoVncClient): NoVncClient {
    client.addEventListener("connect", () => this._connectionStatus.update(() => "connected"));
    client.addEventListener("disconnect", ev => this.handleDisconnect(ev.detail.clean));
    client.addEventListener("clipboard", ev => {
      // emit the event
      this._consoleClipboardUpdated.update(() => ev.detail.text);

      // if enabled at the app level and permitted by the user, automatically copy text to local clipboard
      if (!this.cfConfig.enableClipboard) {
        this.logger.log(LogLevel.INFO, "The remote console tried to copy text to the local clipboard, but local clipboard access is disabled in ConsoleForge's configuration.");
        return;
      }

      const currentUserSettings = this.userSettings.settings();
      if (!currentUserSettings.console.allowCopyToLocalClipboard) {
        this.logger.log(LogLevel.INFO, "The remote console tried to copy text to the local clipboard, but you've disabled local clipboard copy. Use ConsoleForge's settings to allow it to copy text to your local clipboard.");
        return;
      }

      if (ev.detail.text) {
        this.clipboardService.copyText(ev.detail.text);
      }
    });

    return client;
  }

  private doPostConnectionConfig(client: NoVncClient, options: ConsoleConnectionOptions): NoVncClient {
    client.background = options.backgroundStyle || "";
    client.resizeSession = true;

    // try focus if requested
    if (options.autoFocusOnConnect) {
      client.focus();
    }

    return client;
  }

  private handleDisconnect(isManualDisconnect: boolean) {
    this._connectionStatus.update(() => "disconnected");

    if (!isManualDisconnect) {
      this.logger.log(LogLevel.WARNING, "Unexpected disconnection");
    }

    if (this.noVncClient) {
      this.noVncClient.disconnect();
      this.noVncClient = undefined;
    }
  }
}
