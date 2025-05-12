import { Signal } from "@angular/core";
import { ConsoleConnectionOptions } from "../../models/console-connection-options";
import { ConsoleConnectionStatus } from "../../models/console-connection-status";
import { ConsoleSupportedFeatures } from "../../models/console-supported-features";

export interface ConsoleClientService {
  readonly connectionStatus: Signal<ConsoleConnectionStatus>;
  readonly consoleClipboardUpdated: Signal<string>;
  readonly localClipboardUpdated: Signal<string>;

  connect(url: string, options: ConsoleConnectionOptions): Promise<ConsoleSupportedFeatures>;
  disconnect(): Promise<void>;
  getScreenshot(): Promise<Blob>;
  sendClipboardText(text: string): Promise<void>;
  sendCtrlAltDelete(): Promise<void>;
  setScaleToContainerSize(scaleToContainerSize: boolean): Promise<void>;
  setIsViewOnly(isViewOnly: boolean): Promise<void>;

  /**
   * Automatically called by the console component on destroy. Disconnect any clients/websocket usage here
   * (or just do it in your disconnect logic and call that internally in your implementation).
   */
  dispose(): Promise<void>;
}
