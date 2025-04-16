import { computed, Injectable, signal } from '@angular/core';
import { ConsoleClientService } from './console-client.service';
import { ConsoleConnectionStatus } from '@/models/console-connection-status';

@Injectable({ providedIn: 'root' })
export class VncConsoleClientService implements ConsoleClientService {
  public readonly connectionStatus = computed(() => this._connectionStatus());
  private readonly _connectionStatus = signal<ConsoleConnectionStatus>("disconnected");

  connect(url: string): Promise<void> {
    try {
      this._connectionStatus.update(() => "connecting");
      // do some cool connection stuff
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
