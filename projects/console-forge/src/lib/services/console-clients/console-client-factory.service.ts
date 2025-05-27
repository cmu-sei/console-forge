//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { inject, Injectable, Injector } from '@angular/core';
import { ConsoleClientService } from './console-client.service';
import { ConsoleClientType } from '../../models/console-client-type';
import { VncConsoleClientService } from './vnc-console-client/vnc-console-client.service';
import { VmWareConsoleClientService } from './vmware/vmware-console-client.service';

@Injectable({ providedIn: 'root' })
export class ConsoleClientFactoryService {
  private injector = inject(Injector);

  get(consoleClientType: ConsoleClientType): ConsoleClientService {
    switch (consoleClientType) {
      case "vmware": {
        const client = this.injector.get(VmWareConsoleClientService);
        if (!client) {
          throw new Error(`Couldn't resolve instance from injector token ${VmWareConsoleClientService}`);
        }

        return client;
      }
      case "vnc": {
        const client = this.injector.get(VncConsoleClientService);
        if (!client) {
          throw new Error(`Couldn't resolve instance from injector token ${VncConsoleClientService}`);
        }

        return client;
      }
      default:
        throw new Error(`Console type ${consoleClientType} NYI`);
    }
  }
}
