import { ConsoleConnectionOptions } from "@/models/console-connection-options";
import { ConsoleConnectionStatus } from "@/models/console-connection-status";
import { Signal } from "@angular/core";

export interface ConsoleClientService {
  connectionStatus: Signal<ConsoleConnectionStatus>;
  connect(url: string, options: ConsoleConnectionOptions): Promise<void>;
  disconnect(): Promise<void>;
  sendCtrlAltDelete(): Promise<void>;
  dispose(): void;
}
