//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop"
import { debounceTime, Subject } from 'rxjs';
import { ConsoleClientService } from '../console-client.service';
import { LoggerService } from '../../logger.service';
import { ConsoleConnectionOptions } from '../../../models/console-connection-options';
import { ConsoleConnectionStatus } from '../../../models/console-connection-status';
import { ConsolePowerRequest } from '../../../models/console-power-request';
import { ConsoleSupportedFeatures } from '../../../models/console-supported-features';
import { LogLevel } from '../../../models/log-level';
import { createWmksClient, patchWmksLockKeys, WmksClient, WmksClientCreateOptions } from "../../../shims/vmware-wmks.shim";
import { WmksConnectionState, WmksEvents, WmksPosition } from '../../../shims/vmware-mks.models';
import { WINDOW } from '../../../injection/window.injection-token';
import { ClipboardService } from '../../clipboard/clipboard.service';
import { ConsoleForgeConfig } from '../../../config/console-forge-config';
import { UserSettingsService } from '../../user-settings.service';
import { ConsoleClientType } from '../../../models/console-client-type';
import { ConsoleUserSettings } from '../../../models/console-user-settings';
import { UuidService } from '../../uuid.service';
import { WmksLoaderService } from "./wmks-loader.service";

@Injectable({ providedIn: 'root' })
export class VmWareConsoleClientService implements ConsoleClientService {
  private readonly cfConfig = inject(ConsoleForgeConfig);
  private readonly clipboardService = inject(ClipboardService);
  private readonly logger = inject(LoggerService);
  private readonly document = inject(DOCUMENT);
  private readonly userSettings = inject(UserSettingsService);
  private readonly uuids = inject(UuidService);
  private readonly window = inject(WINDOW);
  private readonly wmksLoader = inject(WmksLoaderService);
  private wmksClient?: WmksClient;
  /** Identifies the current connect attempt, so an attempt suspended on the SDK load can tell it was superseded. */
  private connectAttempt = 0;

  /** The highest attempt number a caller has torn down via disconnect()/dispose(). */
  private cancelledAttempt = 0;

  /** Settles an in-flight connect promise when a teardown means no SDK event will ever arrive. */
  private settlePendingConnect?: () => void;

  public readonly clientType: ConsoleClientType = "vmware";
  private readonly _connectionStatus = signal<ConsoleConnectionStatus>("disconnected")
  public readonly connectionStatus = this._connectionStatus.asReadonly();

  private readonly _consoleClipboardUpdated = signal<string>("");
  public readonly consoleClipboardUpdated = this._consoleClipboardUpdated.asReadonly();

  private readonly _supportedFeatures = signal<ConsoleSupportedFeatures>({
    clipboardAutomaticLocalCopy: false,
    clipboardRemoteWrite: false,
    onScreenKeyboard: true,
    powerManagement: false,
    viewOnlyMode: false
  });
  public readonly supportedFeatures = this._supportedFeatures.asReadonly();

  private readonly _needsCanvasSizeUpdate = new Subject<void>();
  private readonly _needsCanvasSizeUpdateSub = this._needsCanvasSizeUpdate.pipe(
    debounceTime(250),
    takeUntilDestroyed()
  ).subscribe(() => {
    if (this.wmksClient) {
      this.logger.log(LogLevel.DEBUG, "Document size change, updating canvas");

      if (this.wmksClient && this.wmksClient.getConnectionState() == "connected") {
        this.wmksClient.updateScreen();
      }
    }
  });

  constructor() {
    // listen for user settings changes so we can update the console
    effect(() => {
      const settings = this.userSettings.settings();

      if (!this.wmksClient) {
        return;
      }

      this.updateFromUserSettings(settings);
    });
  }

  public async connect(url: string, options: ConsoleConnectionOptions): Promise<void> {
    if (!options.hostElement) {
      throw new Error("A host element is required to connect to a VMWare WMKS console.");
    }

    if (!options.hostElement.id) {
      this.logger.log(LogLevel.WARNING, "The host element is present but has no ID. VMWare's WMKS requires that it have one, so generating a dummy for now.");
      options.hostElement.id = `cf-console-vmware-dummy-${this.uuids.get()}`;
    }

    this.logger.log(LogLevel.DEBUG, "Connecting to WMKS...", options);
    const attempt = ++this.connectAttempt;
    this._connectionStatus.update(() => "connecting");

    try {
      await this.wmksLoader.ensureLoaded();
    }
    catch (err) {
      // the SDK never loaded, so no client and no SDK event will ever move this off "connecting"
      if (attempt === this.connectAttempt) {
        this._connectionStatus.update(() => "disconnected");
      }

      throw err;
    }

    if (attempt <= this.cancelledAttempt) {
      this.logger.log(LogLevel.DEBUG, "VMWare connection was torn down while the SDK loaded; not connecting.");
      return;
    }

    if (attempt !== this.connectAttempt) {
      this.logger.log(LogLevel.WARNING, "A newer VMWare connection attempt superseded this one while the SDK loaded; not connecting.");
      return;
    }

    return new Promise((resolve, reject) => {
      this.settlePendingConnect = resolve;

      const wmksOptions: WmksClientCreateOptions = {
        changeResolution: true,
        rescale: false,
        useNativePixels: true,
        useVNCHandshake: false,
        position: WmksPosition.CENTER
      };

      this.logger.log(LogLevel.DEBUG, "Creating WMKS client...", options.hostElement.id, wmksOptions);
      this.wmksClient = createWmksClient(options.hostElement.id, wmksOptions)
        .register(WmksEvents.CONNECTION_STATE_CHANGE, (ev, data) => {
          this.logger.log(LogLevel.DEBUG, "WMKS state change", ev, data);

          if (data.state === WmksConnectionState.DISCONNECTED) {
            // a teardown the caller asked for already moved us to "disconnected", so only a disconnect that
            // arrives while this attempt is still handshaking is a connection failure
            const failedWhileConnecting = attempt === this.connectAttempt
              && untracked(this._connectionStatus) === "connecting";

            this._connectionStatus.update(() => "disconnected");
            this.doPostDisconnectionConfig();
            this.settlePendingConnect = undefined;

            if (failedWhileConnecting) {
              reject(new Error("The WMKS console disconnected before the connection completed."));
            } else {
              resolve();
            }
          }

          if (data.state === WmksConnectionState.CONNECTED) {
            this.logger.log(LogLevel.DEBUG, "WMKS confirms connection", this.wmksClient);
            this.doPostConnectionConfig(options.hostElement);
            this._supportedFeatures.update(() => ({
              clipboardAutomaticLocalCopy: false,
              clipboardRemoteWrite: false,
              onScreenKeyboard: true,
              powerManagement: false,
              viewOnlyMode: false
            }))
            this._connectionStatus.update(() => "connected");
            this.settlePendingConnect = undefined;
            resolve();
          }
        })
        .register(WmksEvents.COPY, (ev, data) => {
          this.logger.log(LogLevel.DEBUG, "Clipboard data available", ev, data);

          // emit the event
          this._consoleClipboardUpdated.update(() => data);

          // if enabled in config and permitted by the user, copy text to local clipboard
          if (!this.cfConfig.disabledFeatures.clipboard && this.userSettings.settings().console.allowCopyToLocalClipboard) {
            this.clipboardService.copyText(data, true);
          }
        })
        .register(WmksEvents.ERROR, (ev, data) => {
          this.logger.log(LogLevel.ERROR, "Error from WMKS:", this.describeWmksError(ev), this.describeWmksError(data));
        })
        // as far as i can tell, this never happens
        .register(WmksEvents.HEARTBEAT, (ev, data) => this.logger.log(LogLevel.DEBUG, "WMKS heartbeat", ev, data))
        .register(WmksEvents.REMOTE_SCREEN_SIZE_CHANGE, (ev, data) => {
          if (!this.wmksClient) {
            return;
          }

          this.logger.log(LogLevel.DEBUG, "Remote screen size change", ev, data);
          this.wmksClient.updateScreen();
        })
        .register(WmksEvents.TOGGLE, (ev, data) => {
          this.logger.log(LogLevel.DEBUG, "Visible devices toggle", ev, data);
        });

      this.wmksClient.connect(url);
    });
  }

  public disconnect(): Promise<void> {
    this.cancelledAttempt = this.connectAttempt;
    this._connectionStatus.update(() => "disconnected");

    const settle = this.settlePendingConnect;
    this.settlePendingConnect = undefined;

    if (this.wmksClient) {
      this.wmksClient.disconnect();
      this.wmksClient = undefined;
    }

    settle?.();
    return Promise.resolve();
  }

  async sendClipboardText(text: string): Promise<void> {
    throw new Error(`Can't send clipboard text to VMWare-based consoles. (text: ${text})`);
  }

  public sendCtrlAltDelete(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.wmksClient) {
          throw new Error("Couldn't resolve client; can't send Ctrl+Alt+Del");
        }

        this.wmksClient.sendCAD();
        resolve();
      }
      catch (err) {
        reject(err)
      }
    });
  }

  public async sendKeyboardInput(text: string): Promise<void> {
    if (!this.wmksClient) {
      throw new Error("Can't resolve WMKS client; can't send clipboard text.");
    }

    const lines = text.trim().split("\n");
    if (lines.length === 1) {
      this.wmksClient.sendInputString(lines[0])
    } else {
      for (const line of text.split("\n")) {
        this.wmksClient.sendInputString(`${line}\n`);
        await new Promise(r => setTimeout(r, 40));
      }
    }
  }

  public sendPowerRequest(request: ConsolePowerRequest): Promise<void> {
    return Promise.reject(`Power management request aren't supported for VMWare consoles. (rejected request: "${request}")`);
  }

  public setIsViewOnly(isViewOnly: boolean): Promise<void> {
    if (isViewOnly) {
      this.logger.log(LogLevel.INFO, "A 'view-only' request was issued, but this isn't directly supported at the protocol level for VMWare. The ConsoleComponent will do its best to make the console canvas view-only. Request:", isViewOnly);
    }
    return Promise.resolve();
  }

  public dispose(): Promise<void> {
    this.cancelledAttempt = this.connectAttempt;
    this._connectionStatus.update(() => "disconnected");

    const settle = this.settlePendingConnect;
    this.settlePendingConnect = undefined;

    if (this.wmksClient) {
      this.wmksClient.destroy();
      this.wmksClient = undefined;
    }

    settle?.();
    return Promise.resolve();
  }

  private doPostConnectionConfig(hostElement: HTMLElement) {
    if (!this.document) {
      this.logger.log(LogLevel.WARNING, "Couldn't resolve the document for host event listening.");
    }

    this.document.addEventListener("fullscreenchange", this.handleWindowSizeChange.bind(this));
    this.document.addEventListener("resize", this.handleWindowSizeChange.bind(this));

    if (!this.window) {
      this.logger.log(LogLevel.WARNING, "Couldn't resolve the window for host event listening.");
    }

    this.window.addEventListener("resize", this.handleWindowSizeChange.bind(this));

    // also listen for canvas events i guess because it matters or something i hate everything
    const canvas = hostElement.querySelector("canvas");
    if (canvas) {
      canvas.addEventListener("blur", () => {
        if (this.wmksClient) {
          this.wmksClient.ungrab();
        }
      });

      canvas.addEventListener("focus", () => {
        if (this.wmksClient) {
          this.wmksClient.grab();
        }
      })
    }

    // SDK 2.2.0 never forwards Caps Lock / Num Lock / Scroll Lock keypresses to the guest, so patch that
    // here. The keyboard manager doesn't exist until the client has connected, which is why this lives in
    // post-connection config rather than next to createWmksClient.
    if (this.wmksClient) {
      switch (patchWmksLockKeys(this.wmksClient)) {
        case "applied":
          this.logger.log(LogLevel.DEBUG, "Applied the WMKS lock-key workaround; Caps/Num/Scroll Lock will reach the guest.");
          break;
        case "not-needed":
          this.logger.log(LogLevel.DEBUG, "This WMKS build doesn't need the lock-key workaround; skipping it.");
          break;
        case "failed":
          this.logger.log(LogLevel.WARNING, "Couldn't apply the WMKS lock-key workaround. On SDK 2.2.0 the guest won't see Caps/Num/Scroll Lock keypresses.");
          break;
      }
    }

    // finally, update from user settings to ensure the behavior the user expects
    this.updateFromUserSettings(this.userSettings.settings());
  }

  private describeWmksError(value: unknown): string {
    if (value instanceof Error) {
      return `${value.name}: ${value.message}`;
    }

    if (value === null || typeof value !== "object") {
      return String(value);
    }

    try {
      return JSON.stringify(value);
    } catch {
      // jQuery event payloads can be circular
      return String(value);
    }
  }

  private doPostDisconnectionConfig() {
    this.document.removeEventListener("fullscreenchange", this.handleWindowSizeChange.bind(this));
    this.document.removeEventListener("resize", this.handleWindowSizeChange.bind(this));
  }

  private handleWindowSizeChange() {
    this._needsCanvasSizeUpdate.next();
  }

  private updateFromUserSettings(settings: ConsoleUserSettings) {
    if (!this.wmksClient) {
      return;
    }

    this.wmksClient.setOption("changeResolution", settings.console.attemptRemoteSessionResize);
    this.wmksClient.setOption("rescale", settings.console.scaleToCanvasHostSize);
    this.wmksClient.updateScreen();
  }
}
