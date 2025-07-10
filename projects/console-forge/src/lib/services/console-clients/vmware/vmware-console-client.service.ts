//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop"
import { debounceTime, Subject } from 'rxjs';
import { ConsoleClientService } from '../console-client.service';
import { LoggerService } from '../../logger.service';
import { ConsoleConnectionOptions } from '../../../models/console-connection-options';
import { ConsoleConnectionStatus } from '../../../models/console-connection-status';
import { ConsolePowerRequest } from '../../../models/console-power-request';
import { ConsoleSupportedFeatures } from '../../../models/console-supported-features';
import { LogLevel } from '../../../models/log-level';
import { createWmksClient, WmksClient } from "../../../shims/vmware-wmks.shim";
import { WmksConnectionState, WmksEvents, WmksPosition } from '../../../shims/vmware-mks.models';
import { WINDOW } from '../../../injection/window.injection-token';
import { ClipboardService } from '../../clipboard/clipboard.service';
import { ConsoleForgeConfig } from '../../../config/console-forge-config';
import { UserSettingsService } from '../../user-settings.service';
import { ConsoleClientType } from '../../../models/console-client-type';

@Injectable({ providedIn: 'root' })
export class VmWareConsoleClientService implements ConsoleClientService {
  private readonly cfConfig = inject(ConsoleForgeConfig);
  private readonly clipboardService = inject(ClipboardService);
  private readonly logger = inject(LoggerService);
  private readonly document = inject(DOCUMENT);
  private readonly userSettings = inject(UserSettingsService);
  private readonly window = inject(WINDOW);
  private wmksClient?: WmksClient;

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

  public connect(url: string, options: ConsoleConnectionOptions): Promise<void> {
    if (!options.hostElement) {
      throw new Error("A host element is required to connect to a VMWare WMKS console.");
    }

    return new Promise((resolve, reject) => {
      this.wmksClient = createWmksClient(options.hostElement.id, {
        changeResolution: true,
        rescale: true,
        useNativePixels: true,
        useVNCHandshake: false,
        position: WmksPosition.CENTER
      })
        .register(WmksEvents.CONNECTION_STATE_CHANGE, (ev, data) => {
          this.logger.log(LogLevel.DEBUG, "WMKS state change", ev, data);

          if (data.state === WmksConnectionState.DISCONNECTED) {
            this._connectionStatus.update(() => "disconnected");
            this.doPostDisconnectionConfig();
            reject();
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
            resolve();
          }
        })
        .register(WmksEvents.COPY, (ev, data) => {
          this.logger.log(LogLevel.DEBUG, "Clipboard data available", ev, data);

          // emit the event
          this._consoleClipboardUpdated.update(() => data);

          // if enabled in config and permitted by the user, copy text to local clipboard
          if (!this.cfConfig.disabledFeatures.clipboard && this.userSettings.settings().console.allowCopyToLocalClipboard) {
            this.clipboardService.copyText(data);
          }
        })
        .register(WmksEvents.ERROR, (ev, data) => {
          this.logger.log(LogLevel.ERROR, "Error from WMKS:", ev, data);
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
    if (this.wmksClient) {
      this.wmksClient.disconnect();
      this.wmksClient = undefined;
    }

    return Promise.resolve();
  }

  public handlePostFullscreenChange(): void {
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
    this.logger.log(LogLevel.INFO, "A 'view-only' request was issued, but this isn't directly supported at the protocol level for VMWare. The ConsoleComponent will do its best to make the console canvas view-only. Request:", isViewOnly);
    return Promise.resolve();
  }

  public setPreserveAspectRatioOnScale(scaleToContainerSize: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.wmksClient) {
          throw new Error("Couldn't resolve client; can't set option");
        }

        this.wmksClient.setOption("rescale", scaleToContainerSize);
        resolve();
      }
      catch (err) {
        reject(err);
      }
    });
  }

  public dispose(): Promise<void> {
    if (this.wmksClient) {
      this.wmksClient.destroy();
      this.wmksClient = undefined;
    }

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
  }

  private doPostDisconnectionConfig() {
    this.document.removeEventListener("fullscreenchange", this.handleWindowSizeChange.bind(this));
    this.document.removeEventListener("resize", this.handleWindowSizeChange.bind(this));
  }

  private handleWindowSizeChange() {
    this._needsCanvasSizeUpdate.next();
  }
}
