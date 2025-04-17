import { computed, inject, Injectable, signal } from '@angular/core';
import { NoVncClient } from "@novnc/novnc"
import { ConsoleClientService } from './console-client.service';
import { ConsoleConnectionStatus } from '@/models/console-connection-status';
import { LoggerService } from '../logger.service';
import { LogLevel } from '@/models/log-level';

@Injectable({ providedIn: 'root' })
export class VncConsoleClientService implements ConsoleClientService {
  public readonly connectionStatus = computed(() => this._connectionStatus());
  private readonly _connectionStatus = signal<ConsoleConnectionStatus>("disconnected");

  // injected services
  private readonly logger = inject(LoggerService);

  // the actual client from @novnc/novnc
  private noVncClient?: NoVncClient;

  async connect(url: string): Promise<void> {
    try {
      // this.rfbInstance = new RFB(canvasElement, url, {
      //   credentials: {
      //     username: '', password: ''
      //   }
      // };

      this._connectionStatus.update(() => "connecting");
      // do some cool connection stuff
      this.logger.log(LogLevel.DEBUG, "Connecting to", url);
      this._connectionStatus.update(() => "connected");
    }
    catch (err) {
      this._connectionStatus.update(() => "disconnected");
      throw err;
    }

    return new Promise(resolve => resolve());
  }

  disconnect(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  sendCtrlAltDelete(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  dispose(): void {
    throw new Error('Method not implemented.');
  }
}
