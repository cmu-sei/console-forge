//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { effect, inject, Injectable, signal } from '@angular/core';
import NoVncClient, { NoVncOptions } from '@novnc/novnc/core/rfb';
import { ConsoleForgeConfig } from '../../../config/console-forge-config';
import { ConsoleClientType } from '../../../models/console-client-type';
import { ConsoleConnectionOptions } from '../../../models/console-connection-options';
import { ConsoleConnectionStatus } from '../../../models/console-connection-status';
import { ConsolePowerRequest } from '../../../models/console-power-request';
import { ConsoleSupportedFeatures } from '../../../models/console-supported-features';
import { LogLevel } from '../../../models/log-level';
import { ClipboardService } from '../../clipboard/clipboard.service';
import { ConsoleClientService } from '../../../services/console-clients/console-client.service';
import { LoggerService } from '../../../services/logger.service';
import { UserSettingsService } from '../../user-settings.service';
import { ConsoleUserSettings } from '../../../models/console-user-settings';

@Injectable({ providedIn: 'root' })
export class VncConsoleClientService implements ConsoleClientService {
  public readonly clientType: ConsoleClientType = "vnc";
  private readonly _consoleClipboardUpdated = signal<string>("");
  public readonly consoleClipboardUpdated = this._consoleClipboardUpdated.asReadonly();

  private readonly _connectionStatus = signal<ConsoleConnectionStatus>("disconnected");
  public readonly connectionStatus = this._connectionStatus.asReadonly();

  private readonly _supportedFeatures = signal<ConsoleSupportedFeatures>({
    clipboardAutomaticLocalCopy: true,
    clipboardRemoteWrite: true,
    onScreenKeyboard: false,
    powerManagement: false,
    requireReconnectOnExitingFullscreen: true,
    viewOnlyMode: true
  });
  public readonly supportedFeatures = this._supportedFeatures.asReadonly();

  // injected services
  private readonly cfConfig = inject(ConsoleForgeConfig);
  private readonly clipboardService = inject(ClipboardService);
  private readonly logger = inject(LoggerService);
  private readonly userSettings = inject(UserSettingsService);

  // the actual client from @novnc/novnc
  private noVncClient?: NoVncClient;

  constructor() {
    // listen for user settings changes so we can update the console
    effect(() => {
      const settings = this.userSettings.settings();

      if (!this.noVncClient) {
        return;
      }

      this.updateFromUserSettings(this.noVncClient, settings);
    });
  }

  public connect(url: string, options: ConsoleConnectionOptions): Promise<void> {
    if (this.noVncClient) {
      try {
        this.noVncClient.disconnect();
        this.logger.log(LogLevel.DEBUG, "Disconnected from existing VNC session.");
      }
      catch (err) {
        this.logger.log(LogLevel.DEBUG, "Warning: couldn't disconnect from existing VNC session on attempted connection.", err);
      }

      this.noVncClient = undefined;
    }

    return new Promise((resolve, reject) => {
      // track whether we've resolved the promise yet - we need to reject it on the "disconnect" event if it isn't
      let isResolved = false;

      try {
        this._connectionStatus.update(() => "connecting");
        this.logger.log(LogLevel.DEBUG, "Connecting to", url, options);

        const noVncCredentials: NoVncOptions = {
          credentials: {
            password: options?.credentials?.accessTicket || options?.credentials?.password || "",
            // explicitly not supporting these for now
            username: "",
            target: ""
          },
        };

        this.logger.log(LogLevel.DEBUG, "Connecting...", noVncCredentials);
        const client = new NoVncClient(options.hostElement, url, noVncCredentials);

        this.logger.log(LogLevel.DEBUG, "Client instantiated. Configuring...");
        this.doPreConnectionConfig(client);
        this.logger.log(LogLevel.DEBUG, "Pre-connection config done.");

        client.addEventListener("disconnect", event => {
          if (isResolved) {
            return;
          }
          isResolved = true;
          this.logger.log(LogLevel.ERROR, "Connection error", event);
          reject(event);
        });

        client.addEventListener("connect", () => {
          this._connectionStatus.update(() => "connected");
          this.logger.log(LogLevel.DEBUG, "Connected. Performing post-connection configuration...");

          // do other post-connection config
          this.doPostConnectionConfig(client, options);
          this.logger.log(LogLevel.DEBUG, "Post-connection config done. Resolving supported features...");

          // the vnc client knows its capabilities post-connection
          // so send this back along with the things we know we can't support
          const supportedFeatures: ConsoleSupportedFeatures = {
            clipboardAutomaticLocalCopy: true,
            clipboardRemoteWrite: true,
            onScreenKeyboard: false,
            powerManagement: client.capabilities.power,
            requireReconnectOnExitingFullscreen: true,
            viewOnlyMode: true
          };

          this._supportedFeatures.update(() => supportedFeatures);
          this.noVncClient = client;

          this.logger.log(LogLevel.DEBUG, "Connection complete!", this.noVncClient);
          isResolved = true;
          resolve();
        });
      }
      catch (err) {
        this._connectionStatus.update(() => "disconnected");
        this.logger.log(LogLevel.ERROR, "Connection error", err);
        reject(err);
      }
    });
  }

  public async disconnect(): Promise<void> {
    if (!this.noVncClient) {
      this.logger.log(LogLevel.WARNING, "Manual disconnection requested, but no VNC client.");
      return;
    }

    this.logger.log(LogLevel.DEBUG, "Manual disconnection requested");
    this.noVncClient.disconnect();
  }

  public async dispose(): Promise<void> {
    return await this.disconnect();
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
      throw new Error("VNC client isn't connected; can't send Ctrl+Alt+Delete.");
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
      throw new Error("VNC client isn't connected; can't set properties.");
    }

    this.noVncClient.viewOnly = isViewOnly;
  }

  private doPreConnectionConfig(client: NoVncClient) {
    client.addEventListener("connect", () => {
      this._connectionStatus.update(() => "connected");
      this.logger.log(LogLevel.INFO, "Connected!");
    });
    client.addEventListener("disconnect", ev => this.handleDisconnect(ev.detail.clean));
    client.addEventListener("clipboard", ev => {
      // emit the event
      this._consoleClipboardUpdated.update(() => ev.detail.text);

      // if enabled at the app level and permitted by the user, automatically copy text to local clipboard
      if (this.cfConfig.disabledFeatures.clipboard) {
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
  }

  private doPostConnectionConfig(client: NoVncClient, options: ConsoleConnectionOptions) {
    client.background = options.backgroundStyle || "";

    // try focus if requested
    if (options.autoFocusOnConnect) {
      client.focus();
    }

    // set client settings from user's
    this.updateFromUserSettings(client, this.userSettings.settings());
  }

  private handleDisconnect(isManualDisconnect: boolean) {
    this.logger.log(LogLevel.INFO, "Disconnected. Manual?", isManualDisconnect);
    this._connectionStatus.update(() => "disconnected");

    if (!isManualDisconnect) {
      this.logger.log(LogLevel.WARNING, "Unexpected disconnection");
    }

    if (this.noVncClient) {
      this.noVncClient = undefined;
    }
  }

  private updateFromUserSettings(client: NoVncClient, settings: ConsoleUserSettings) {
    if (!client) {
      return;
    }

    try {
      client.scaleViewport = settings.console.scaleToCanvasHostSize;
      client.resizeSession = settings.console.attemptRemoteSessionResize;
    }
    catch (err) {
      this.logger.log(LogLevel.WARNING, "Couldn't update VNC client settings from user settings.", err);
    }
  }
}
