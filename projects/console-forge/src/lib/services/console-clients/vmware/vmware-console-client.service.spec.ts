//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { TestBed } from '@angular/core/testing';

import { VmWareConsoleClientService } from './vmware-console-client.service';
import { WmksLoaderService } from './wmks-loader.service';
import { provideConsoleForge } from '../../../config/provide-console-forge';
import { WmksConnectionState, WmksEvents } from '../../../shims/vmware-mks.models';

describe('VmWareConsoleClientService', () => {
  let service: VmWareConsoleClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideConsoleForge()]
    });
    service = TestBed.inject(VmWareConsoleClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

interface FakeWmksClient {
  connectCalls: string[];
  handlers: Record<string, (ev: unknown, data: unknown) => void>;
  disconnectCalled: boolean;
}

interface FakeWmksApi {
  register(event: string, handler: (ev: unknown, data: unknown) => void): FakeWmksApi;
  connect(url: string): void;
  disconnect(): void;
  destroy(): void;
  updateScreen(): void;
  getConnectionState(): string;
}

function installFakeWmks(): { created: FakeWmksClient[] } {
  const created: FakeWmksClient[] = [];

  // the SDK is a browser global the loader injects at runtime, so a fake has to be installed in its place
  const sdkHost = window as unknown as { WMKS?: unknown };
  sdkHost.WMKS = {
    version: "2.2.0",
    createWMKS: () => {
      const client: FakeWmksClient = { connectCalls: [], handlers: {}, disconnectCalled: false };
      created.push(client);

      const api: FakeWmksApi = {
        register: (event: string, handler: (ev: unknown, data: unknown) => void) => {
          client.handlers[event] = handler;
          return api;
        },
        connect: (url: string) => { client.connectCalls.push(url); },
        disconnect: () => { client.disconnectCalled = true; },
        destroy: () => { /* no-op */ },
        updateScreen: () => { /* no-op */ },
        getConnectionState: () => "connecting"
      };

      return api;
    }
  };

  return { created };
}

describe('VmWareConsoleClientService teardown during connect', () => {
  let service: VmWareConsoleClientService;
  let fake: { created: FakeWmksClient[] };
  let releaseLoader: () => void;
  let failLoader: (err: Error) => void;
  let hostElement: HTMLElement;

  beforeEach(() => {
    fake = installFakeWmks();
    const loading = new Promise<void>((resolve, reject) => {
      releaseLoader = resolve;
      failLoader = reject;
    });

    TestBed.configureTestingModule({
      providers: [
        provideConsoleForge(),
        { provide: WmksLoaderService, useValue: { ensureLoaded: () => loading } }
      ]
    });

    service = TestBed.inject(VmWareConsoleClientService);
    hostElement = document.createElement("div");
    hostElement.id = "cf-test-host";
    document.body.appendChild(hostElement);
  });

  afterEach(() => {
    hostElement.remove();
    // the SDK global is installed only for these tests and must not leak into other specs
    const sdkHost = window as unknown as { WMKS?: unknown };
    delete sdkHost.WMKS;
  });

  it('does not create a client when disconnected while the SDK loads', async () => {
    const connecting = service.connect("wss://example.test/ticket/x", { hostElement });
    expect(service.connectionStatus()).toBe("connecting");

    await service.disconnect();
    releaseLoader();
    await expectAsync(connecting).toBeResolved();

    expect(fake.created.length).toBe(0);
    expect(service.connectionStatus()).toBe("disconnected");
  });

  it('does not report a caller-initiated teardown as a connection failure', async () => {
    const connecting = service.connect("wss://example.test/ticket/x", { hostElement });
    releaseLoader();

    // let connect() resume past its await on the SDK load. The transpiled async helper takes more than one
    // microtask turn, so tick a bounded number of times: the client count, not the turn count, is the contract.
    for (let tick = 0; tick < 10 && fake.created.length === 0; tick++) {
      await Promise.resolve();
    }

    expect(fake.created.length).toBe(1);

    await service.disconnect();
    expect(fake.created[0].disconnectCalled).toBeTrue();

    // the SDK's own state change arrives after the caller already tore the attempt down
    fake.created[0].handlers[WmksEvents.CONNECTION_STATE_CHANGE](
      {}, { state: WmksConnectionState.DISCONNECTED });

    await expectAsync(connecting).toBeResolved();
    expect(service.connectionStatus()).toBe("disconnected");
  });

  it('returns to disconnected when the SDK fails to load', async () => {
    const connecting = service.connect("wss://example.test/ticket/x", { hostElement });

    failLoader(new Error("Couldn't load the VMWare HTML Console SDK."));

    await expectAsync(connecting).toBeRejectedWithError(/Console SDK/);
    expect(service.connectionStatus()).toBe("disconnected");
    expect(fake.created.length).toBe(0);
  });
});
