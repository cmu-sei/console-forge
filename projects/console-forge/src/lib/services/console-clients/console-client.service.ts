//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { Signal } from "@angular/core";
import { ConsoleConnectionOptions } from "../../models/console-connection-options";
import { ConsoleConnectionStatus } from "../../models/console-connection-status";
import { ConsolePowerRequest } from "../../models/console-power-request";
import { ConsoleSupportedFeatures } from "../../models/console-supported-features";

export interface ConsoleClientService {
  readonly connectionStatus: Signal<ConsoleConnectionStatus>;
  readonly consoleClipboardUpdated: Signal<string>;
  readonly supportedFeatures: Signal<ConsoleSupportedFeatures>;

  connect(url: string, options: ConsoleConnectionOptions): Promise<ConsoleSupportedFeatures>;
  copyVmClipboard(): Promise<void>;
  disconnect(): Promise<void>;
  sendClipboardText(text: string): Promise<void>;
  sendCtrlAltDelete(): Promise<void>;
  sendPowerRequest(request: ConsolePowerRequest): Promise<void>
  setPreserveAspectRatioOnScale(preserve: boolean): Promise<void>;
  setIsViewOnly(isViewOnly: boolean): Promise<void>;

  /**
   * Automatically called by the console component on destroy. Disconnect any clients/websocket usage here
   * (or just do it in your disconnect logic and call that internally in your implementation).
   */
  dispose(): Promise<void>;
}
