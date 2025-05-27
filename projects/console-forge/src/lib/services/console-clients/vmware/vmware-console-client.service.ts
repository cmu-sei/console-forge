//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { computed, inject, Injectable, signal } from '@angular/core';
import { ConsoleClientService } from '../console-client.service';
import { ConsoleConnectionOptions } from '../../../models/console-connection-options';
import { ConsoleConnectionStatus } from '../../../models/console-connection-status';
import { ConsoleSupportedFeatures } from '../../../models/console-supported-features';
import { createWmksClient, WmksClient } from "../../../shims/vmware-wmks.shim";
import { WmksConnectionState, WmksEvents, WmksPosition } from '../../../shims/vmware-mks.models';
import { LoggerService } from '../../logger.service';
import { LogLevel } from '../../../models/log-level';
import { ConsolePowerRequest } from '../../../models/console-power-request';

@Injectable({ providedIn: 'root' })
export class VmWareConsoleClientService implements ConsoleClientService {
  private readonly logger = inject(LoggerService);
  private wmksClient?: WmksClient;

  private readonly _connectionStatus = signal<ConsoleConnectionStatus>("disconnected")
  public readonly connectionStatus = this._connectionStatus.asReadonly();

  private readonly _consoleClipboardUpdated = signal<string>("");
  public readonly consoleClipboardUpdated = this._consoleClipboardUpdated.asReadonly();

  private readonly _localClipboardUpdated = signal<string>("");
  public readonly localClipboardUpdated = this._localClipboardUpdated.asReadonly()

  private readonly _supportedFeatures = signal<ConsoleSupportedFeatures>({
    onScreenKeyboard: true,
    reboot: false,
    rebootHard: false,
    shutdown: false
  });
  public readonly supportedFeatures = this._supportedFeatures.asReadonly();

  connect(url: string, options: ConsoleConnectionOptions): Promise<ConsoleSupportedFeatures> {
    if (!options.hostElement) {
      throw new Error("A host element is required to connect to a VMWare WMKS console.");
    }

    return new Promise((resolve, reject) => {
      this.wmksClient = createWmksClient(options.hostElement.id, {
        rescale: true,
        changeResolution: false,
        useVNCHandshake: false,
        position: WmksPosition.CENTER
      })
        .register(WmksEvents.CONNECTION_STATE_CHANGE, (ev, data) => {
          this.logger.log(LogLevel.DEBUG, "WMKS state change", ev, data);
          if (data.state === WmksConnectionState.DISCONNECTED) {
            reject();
          }

          if (data.state === WmksConnectionState.CONNECTED) {
            resolve({
              onScreenKeyboard: true,
              reboot: false,
              rebootHard: false,
              shutdown: false
            });
          }
        })
        .register(WmksEvents.HEARTBEAT, (ev, data) => this.logger.log(LogLevel.DEBUG, "WMKS heartbeat!", ev, data));

      this.wmksClient.connect(url);
    });
    // this.wmksClient = createWmksClient(options.hostElement.id)

    //   .register(WMKS.CONST.Events.REMOTE_SCREEN_SIZE_CHANGE, (e: any, data: any) => {
    //     // console.log('wmks remote_screen_size_change: ' + data.width + 'x' + data.height);
    //     // TODO: if embedded, pass along dimension to canvas wrapper element
    //   })
    //   .register(WMKS.CONST.Events.HEARTBEAT, (e: any, data: any) => {
    //     // debug('wmks heartbeat: ' + data);
    //     console.log('wmks heartbeat: ' + data);
    //   })
    //   .register(WMKS.CONST.Events.COPY, (e: any, data: any) => {
    //     // console.log('wmks copy: ' + data);
    //     stateCallback('clip:' + data);
    //   })
    //   .register(WMKS.CONST.Events.ERROR, (e: any, data: any) => {
    //     // debug('wmks error: ' + data.errorType);

    //   })
    //   .register(WMKS.CONST.Events.FULL_SCREEN_CHANGE, (e: any, data: any) => {
    //     // debug('wmks full_screen_change: ' + data.isFullScreen);
    //   });;
  }

  disconnect(): Promise<void> {
    if (this.wmksClient) {
      this.wmksClient.disconnect();
      this.wmksClient = undefined;
    }

    return Promise.resolve();
  }

  getScreenshot(): Promise<Blob> {
    console.warn("NYI");
    return Promise.resolve(new Blob());
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sendClipboardText(text: string): Promise<void> {
    console.warn("NYI");
    return Promise.resolve();
  }

  sendCtrlAltDelete(): Promise<void> {
    console.warn("NYI");
    return Promise.resolve();
  }

  sendPowerRequest(request: ConsolePowerRequest): Promise<void> {
    console.warn("NYI");
    return Promise.resolve();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setIsViewOnly(isViewOnly: boolean): Promise<void> {
    console.warn("NYI");
    return Promise.resolve();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setPreserveAspectRatioOnScale(scaleToContainerSize: boolean): Promise<void> {
    console.warn("NYI");
    return Promise.resolve();
  }

  dispose(): Promise<void> {
    if (this.wmksClient) {
      this.wmksClient.destroy();
      this.wmksClient = undefined;
    }

    return Promise.resolve();
  }
}
